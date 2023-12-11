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
            res.send({status: 2, score: zxcvbnScore, feedback: zxcvbnFeedback});
        } else {
            const userExists = await isUserAlreadyRegistered(email);
            if (userExists) {
                // eslint-disable-next-line max-len
                res.send({status: 0, error: 'username or email already taken', msg: 'Your username or email is already taken.'});
            } else {
                const newUser = await registerNewUser(firstName, lastName, email, passwords, birthdate, phonenumber);
                res.status(418);
                res.send({juhu: "hu"});
            }
        }
    } catch (error) {
        res.send({status: 0, error: 'Registration failed'});
    } finally {
        if (conn) conn.release();
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
                
            }
        }
    } catch (error) {
        console.log(error);
        res.send({status: 0, error: 'error'});
    } finally {
        if (conn) conn.release();
    }
});

module.exports = {router, registerNewUser, isUserAlreadyRegistered};
