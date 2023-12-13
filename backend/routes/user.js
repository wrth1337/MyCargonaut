const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');
const {zxcvbn, zxcvbnOptions} = require('@zxcvbn-ts/core');
const zxcvbnCommonPackage = require('@zxcvbn-ts/language-common');
const zxcvbnEnPackage = require('@zxcvbn-ts/language-en');
const zxcvbnDePackage = require('@zxcvbn-ts/language-de');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Express Limiter
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
});
router.use(limiter);

// Database settings
const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

// ZXCVBN settings
const zxcvbnSettings = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
        ...zxcvbnDePackage.dictionary,
    },
};

// JWT settings
const jwtSecret = process.env.JWT_SECRET || 'TEST_DEV_SECRET';

// ---Methods--- //
async function registerNewUser(firstName, lastName, email, password, birthdate, phonenumber) {
    const hashedPassword = await argon2.hash(password);
    const newUser ='INSERT INTO user (firstName, lastName, email, password, birthdate, phonenumber, coins) VALUES (?, ?, ?, ?, ?, ?, 0)';
    try {
        const conn = await pool.getConnection();
        // eslint-disable-next-line no-unused-vars
        const result = await conn.query(newUser, [firstName, lastName, email, hashedPassword, birthdate, phonenumber]);
        await conn.release();
        console.log('User registered successfully');
        return 0;
    } catch (error) {
        return 1;
    }
}

async function isUserAlreadyRegistered(email) {
    const checkUsername = 'SELECT COUNT(*) AS count FROM user WHERE email = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(checkUsername, [email]);
        await conn.release();
        return (result[0].count > 0);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function isEmailValid(email) {
    // eslint-disable-next-line max-len
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regexEmail.test(email);
}

async function isDateValid(birthdate) {
    const regexBirthdate = /[0-9][0-9][0-9][0-9]-(0[0-9]|1[0-2])-(0[0-9]|1[0-9]|2[0-9]|3[0-1])/;
    return regexBirthdate.test(birthdate);
}

async function isPhonenumberValid(phonenumber) {
    const regexPhonenumber = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
    return regexPhonenumber.test(phonenumber);
}

// ---Routes--- //
router.post('/register', async function(req, res, next) {
    const conn = await pool.getConnection();
    zxcvbnOptions.setOptions(zxcvbnSettings);
    try {
        const {firstName, lastName, email, passwords, birthdate, phonenumber} = req.body;
        const zxcvbnResults = zxcvbn(passwords, [firstName, lastName, email, birthdate, phonenumber]);
        const zxcvbnScore = zxcvbnResults.score;
        const zxcvbnFeedback = zxcvbnResults.feedback;
        if (!await isPhonenumberValid(phonenumber)) {
            res.status(422);
            res.send({status: 3, msg: 'No valid phonenumber'});
        } else if (!await isEmailValid(email)) {
            res.status(422);
            res.send({status: 4, msg: 'No valid email'});
        } else if (!await isDateValid(birthdate)) {
            res.status(422);
            res.send({status: 5, msg: 'No valid birthdate'});
        } else if (zxcvbnScore <= 2) {
            res.status(422);
            res.send({status: 2, score: zxcvbnScore, feedback: zxcvbnFeedback});
        } else {
            const userExists = await isUserAlreadyRegistered(email);
            if (userExists) {
                res.status(409);
                res.send({status: 1, msg: 'Your email is already taken.'});
            } else {
                // eslint-disable-next-line no-unused-vars
                const newUser = await registerNewUser(firstName, lastName, email, passwords, birthdate, phonenumber);
                res.status(201);
                res.send({status: 0, msg: 'User created'});
            }
        }
    } catch (error) {
        res.status(500);
        res.send({status: 99, error: 'Registration failed'});
    } finally {
        if (conn) await conn.release();
    }
});

router.post('/login', async function(req, res, next) {
    const conn = await pool.getConnection();
    try {
        const {email, password} = req.body;

        const getUserData = `SELECT * FROM user WHERE email = ?`;
        const result = await conn.query(getUserData, [email]);

        if (result.length > 0) {
            const hashedPassword = result[0].password;
            const passwordIsCorrect = argon2.verify(hashedPassword, password.toString());
            if (passwordIsCorrect) {
                let token = jwt.sign({email: email, user_id: result[0].user_id}, jwtSecret, {expiresIn: '1h'});
                res.send({status: 1, data: {email, user_id: result[0].user_id}, token: token});
            }else{
                res.send({status: 0, error: 'error'});
            }
        }else{
            res.send({status: 0, error: 'error'});
        }
    } catch (error) {
        res.send({status: 0, error: 'error'});
    } finally {
        if (conn) conn.release();
    }
});

module.exports = {router, registerNewUser, isUserAlreadyRegistered, isEmailValid, isPhonenumberValid, isDateValid};
