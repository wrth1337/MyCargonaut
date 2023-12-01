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

        return 1;
    } catch (error) {
        return 0;
    }
}
