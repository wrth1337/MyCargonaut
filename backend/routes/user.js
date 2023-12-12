const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');
const {zxcvbn, zxcvbnOptions} = require('@zxcvbn-ts/core');
const zxcvbnCommonPackage = require('@zxcvbn-ts/language-common');
const zxcvbnEnPackage = require('@zxcvbn-ts/language-en');
const zxcvbnDePackage = require('@zxcvbn-ts/language-de');
const argon2 = require('argon2');

// eslint-disable-next-line new-cap
const router = express.Router();
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
});

router.use(limiter);

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

const zxcvbnSettings = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
        ...zxcvbnDePackage.dictionary,
    },
};

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

async function isBirthdateValid(birthdate) {
    const regexBirthdate = /[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/;
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
        if (zxcvbnScore <= 2) {
            res.status(422);
            res.send({status: 2, score: zxcvbnScore, feedback: zxcvbnFeedback});
        } else {
            const userExists = await isUserAlreadyRegistered(email);
            if (userExists) {
                res.status(409);
                res.send({status: 0, error: 'username or email already taken', msg: 'Your username or email is already taken.'});
            } else {
                // eslint-disable-next-line no-unused-vars
                const newUser = await registerNewUser(firstName, lastName, email, passwords, birthdate, phonenumber);
                res.status(201);
                res.send({status: 1, msg: 'User created'});
            }
        }
    } catch (error) {
        res.send({status: 0, error: 'Registration failed'});
    } finally {
        if (conn) await conn.release();
    }
});

module.exports = {router, registerNewUser, isUserAlreadyRegistered, isEmailValid, isPhonenumberValid, isBirthdateValid};
