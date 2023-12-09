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

/*
TODO: Test muss noch auf die neue Datenbank angepasst werden MK-09.12.2023
test('add new user', async () => {
    registerNewUser('testuser', 'testpassword');
    const conn = await pool.getConnection();
    const result = await conn.query('SELECT * FROM users WHERE name = (?)', ['testuser']);
    await conn.query('DELETE FROM users;');
    await conn.release();
    expect((result[0].name)).toBe('testuser');
    expect((result[0].password)).toBe('testpassword');
});
*/


/*
TODO: Test muss noch auf die neue Datenbank angepasst werden MK-09.12.2023
test('user is already registered', async () =>{
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO users (name, password) VALUES (?,?)', ['testuser', 'testpassword']);
    const result = await isUserAlreadyRegistered('testuser');
    await conn.query('DELETE FROM users;');
    await conn.release();
    expect(result).toBe(true);
});
*/

test('register new user in database via backend', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    // Call the function with test data
    const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

    // Expect the function to return 0 (success)
    expect(result).toBe(0);

    // Verify the user is in the database
    const conn = await pool.getConnection();
    const dbResult = await conn.query('SELECT * FROM user WHERE email = ?', [email]);
    await conn.release();

    // Expect the user data in the database to match the test data
    expect(dbResult[0].firstName).toBe(firstName);
    expect(dbResult[0].lastName).toBe(lastName);
    expect(dbResult[0].email).toBe(email);
    expect(dbResult[0].phonenumber).toBe(phonenumber);

    // Clean up the test data from the database
    const conn2 = await pool.getConnection();
    await conn2.query('DELETE FROM user WHERE email = ?', [email]);
    await conn2.release();
});

/*
TODO: Test muss noch auf die neue Datenbank angepasst werden MK-09.12.2023
test('user isnt registered yet', async () =>{
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO user (name, password) VALUES (?,?)', ['testuser1', 'testpassword']);
    const result = await isUserAlreadyRegistered('testuser2');
    await conn.query('DELETE FROM user;');
    await conn.release();
    expect(result).toBe(false);
});
*/
