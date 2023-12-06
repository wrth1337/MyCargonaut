const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');
const {zxcvbn, zxcvbnOptions} = require('@zxcvbn-ts/core');
const zxcvbnCommonPackage = require('@zxcvbn-ts/language-common');
const zxcvbnEnPackage = require('@zxcvbn-ts/language-en');
const zxcvbnDePackage = require('@zxcvbn-ts/language-de');

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
async function registerNewUser(username, password) {
    const newUser ='INSERT INTO users (name, password) VALUES (?, ?)';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(newUser, [username, password]);
        conn.release();

        return 0;
    } catch (error) {
        return 1;
    }
}

async function isUserAlreadyRegistered(username) {
    const checkUsername = 'SELECT COUNT(*) AS count FROM users WHERE name = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(checkUsername, [username]);
        await conn.release();
        return (result[0].count > 0);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// ---Routes--- //
router.post('/register', async function(req, res, next) {
    console.log('Register server reached 1');

    const conn = await pool.getConnection();
    try {
        const {username, password} = req.body;
        const userExists = await isUserAlreadyRegistered(username);

        if (userExists) {
            res.send({status: 0, error: 'username or email already taken', msg: 'Your username or email is already taken.'});
        } else {
            const newUser = await registerNewUser(username, password);
        }
    } catch (error) {
        res.send({status: 0, error: 'Registration failed'});
    } finally {
        if (conn) conn.release();
    }
});

module.exports = {router, registerNewUser, isUserAlreadyRegistered};
