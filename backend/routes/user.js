const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');
const {zxcvbn, zxcvbnOptions} = require('@zxcvbn-ts/core');
const zxcvbnCommonPackage = require('@zxcvbn-ts/language-common');
const zxcvbnEnPackage = require('@zxcvbn-ts/language-en');
const zxcvbnDePackage = require('@zxcvbn-ts/language-de');

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
async function registerNewUser(firstName, lastName, email, passwords, birthdate, phonenumber) {
    const newUser ='INSERT INTO user (firstName, lastName, email, passwords, birthdate, phonenumber, coins) VALUES (?, ?, ?, ?, ?, ?, 0)';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(newUser, [firstName, lastName, email, passwords, birthdate, phonenumber]);
        conn.release();

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
            }
        }
    } catch (error) {
        res.send({status: 0, error: 'Registration failed'});
    } finally {
        if (conn) conn.release();
    }
});

module.exports = {router, registerNewUser, isUserAlreadyRegistered};
