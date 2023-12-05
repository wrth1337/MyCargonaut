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
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

// ---Methods--- //
async function registerNewUser(firstName, lastName, email, passwords, birthdate) {
    const newUser ='INSERT INTO users (firstName, lastName, email, passwords, birthdate) VALUES (?, ?, ?, ?, ?)';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(newUser, [firstName, lastName, email, passwords, birthdate]);
        conn.release();

        return 0;
    } catch (error) {
        return 1;
    }
}

async function isUserAlreadyRegistered(email) {
    const checkUsername = 'SELECT COUNT(*) AS count FROM users WHERE name = ?';

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
    console.log('Register server reached 1');

    const conn = await pool.getConnection();
    try {
        const {firstName, lastName, email, passwords, birthdate} = req.body;
        const userExists = await isUserAlreadyRegistered(email);

        if (userExists) {
            res.send({status: 0, error: 'username or email already taken', msg: 'Your username or email is already taken.'});
        } else {
            const newUser = await registerNewUser(firstName, lastName, email, passwords, birthdate);
        }
    } catch (error) {
        res.send({status: 0, error: 'Registration failed'});
    } finally {
        if (conn) conn.release();
    }
});

module.exports = {router, registerNewUser, isUserAlreadyRegistered};
