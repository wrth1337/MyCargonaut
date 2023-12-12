const {expect, test, afterAll} = require('@jest/globals');
const {registerNewUser, isUserAlreadyRegistered, isEmailValid} = require('../routes/user');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

// Test: registerNewUser()
test('register new user in database via backend', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    let conn;

    try {
        // Call the function with test data
        const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

        // Expect the function to return 0 (success)
        expect(result).toBe(0);

        // Verify the user is in the database
        conn = await pool.getConnection();
        const dbResult = await conn.query('SELECT * FROM user WHERE email = ?', [email]);

        // Expect the user data in the database to match the test data
        expect(dbResult[0].firstName).toBe(firstName);
        expect(dbResult[0].lastName).toBe(lastName);
        expect(dbResult[0].email).toBe(email);
        expect(dbResult[0].phonenumber).toBe(phonenumber);

    } finally {
        // Always release the connection
        if (conn) await conn.release();
    }

    try {
        // Clean up the test data from the database
        conn = await pool.getConnection();
        await conn.query('DELETE FROM user WHERE email = ?', [email]);
    } finally {
        // Always release the connection
        if (conn) await conn.release();
    }
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

// Test: isEmailValid()
test('emailvalidation finds correct emails', async () => {
    expect(await isEmailValid('testemail@gmail.de')).toBeTruthy();
    expect(await isEmailValid('test.email@gmail.de')).toBeTruthy();
    expect(await isEmailValid('t@gmail.de')).toBeTruthy();
    expect(await isEmailValid('mysite@you.me.net')).toBeTruthy();
});
test('emailvalidation finds falsy emails', async () => {
    expect(await isEmailValid('testemailgmail.de')).toBeFalsy();
    expect(await isEmailValid('testem!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ailgmail.de')).toBeFalsy();
    expect(await isEmailValid('quatsch')).toBeFalsy();
    expect(await isEmailValid('LeetHaxx0r@gmail@web.de')).toBeFalsy();
    expect(await isEmailValid('mysite@.com.my')).toBeFalsy();
    expect(await isEmailValid('@com.my')).toBeFalsy();
    expect(await isEmailValid('mysite123@gmail.b')).toBeFalsy();
    expect(await isEmailValid('.mysite@mysite.org')).toBeFalsy();
    expect(await isEmailValid('mysite()*@gmail.com')).toBeFalsy();
    expect(await isEmailValid('mysite..1234@yahoo.com')).toBeFalsy();
});

// Jest afterAll function
afterAll(() => {
    // Close the pool
    pool.end(err => {
        if (err) {
            console.error('Fehler beim Schließen der Datenbankverbindung:', err);
        } else {
            console.log('Datenbankverbindung erfolgreich geschlossen.');
        }
    });
});
