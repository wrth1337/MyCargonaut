const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
});

router.use(limiter);

const pool = mariadb.createPool({
    host: 'database',
    port: '3306',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

// ---Methods--- //
async function registerNewUser(username, password) {
    const newUser ='INSERT INTO users (username, pass) VALUES (?, ?)';

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
    const checkUsername = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(checkUsername, [username]);
        conn.release();

        const count = result[0].count;
        return count > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// ---Routes--- //
router.post('/register', async function(req, res, next) {
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

module.exports = router;
