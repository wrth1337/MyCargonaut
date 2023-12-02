const {expect, test} = require('@jest/globals');
const {registerNewUser} = require('../routes/user');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('add new user', async () => {
    registerNewUser('testuser', 'testpassword');
    const conn = await pool.getConnection();
    const result = await conn.query('SELECT * FROM users WHERE name = (?)', ['testuser']);
    conn.query('DELETE FROM users;');
    conn.release();
    expect((result[0].name)).toBe('testuser');
    expect((result[0].password)).toBe('testpassword');
});
