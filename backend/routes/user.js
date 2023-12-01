const mariadb = require('mariadb');


const pool = mariadb.createPool({
    host: 'database',
    port: '3306',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

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
