const {expect, test} = require('@jest/globals');
const {registerNewUser, isUserAlreadyRegistered} = require('../routes/user');
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
    await conn.query('DELETE FROM users;');
    await conn.release();
    expect((result[0].name)).toBe('testuser');
    expect((result[0].password)).toBe('testpassword');
});

test('user is already registered', async () =>{
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO users (name, password) VALUES (?,?)', ['testuser', 'testpassword']);
    const result = await isUserAlreadyRegistered('testuser');
    await conn.query('DELETE FROM users;');
    await conn.release();
    expect(result).toBe(true);
});

test('user isnt registered yet', async () =>{
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO users (name, password) VALUES (?,?)', ['testuser1', 'testpassword']);
    const result = await isUserAlreadyRegistered('testuser2');
    await conn.query('DELETE FROM users;');
    await conn.release();
    expect(result).toBe(false);
});
