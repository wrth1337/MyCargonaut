const {expect, test, afterAll} = require('@jest/globals');
const argon2 = require('argon2');
const {registerNewUser, isUserAlreadyRegistered, isEmailValid, isPhonenumberValid, isDateValid} = require('../routes/user');
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

test('registerNewUser argon2id functionality', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    // Register a new user
    const registerResult = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

    // Expect the function to return 0 (success)
    expect(registerResult).toBe(0);

    let conn;

    try {
        // Verify the user is in the database
        conn = await pool.getConnection();
        const dbResult = await conn.query('SELECT * FROM user WHERE email = ?', [email]);

        // Verify the hashed password
        const isVerified = await argon2.verify(dbResult[0].password, password);

        // Expect the verification to be true
        expect(isVerified).toBe(true);

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


test('registerNewUser argon2id functionality negativ test', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    // Register a new user
    const registerResult = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

    // Expect the function to return 0 (success)
    expect(registerResult).toBe(0);

    let conn;

    try {
        // Verify the user is in the database
        conn = await pool.getConnection();
        const dbResult = await conn.query('SELECT * FROM user WHERE email = ?', [email]);

        if(dbResult[0].password === password){
            isVerified = true;
        }isVerified = false;
        // Expect the verification to be true
        expect(isVerified).toBe(false);

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

// Test: isPhonenumberValid()
test('phonennumbervalidation finds correct phonennumbers', async () => {
    expect(await isPhonenumberValid('027743829')).toBeTruthy();
    expect(await isPhonenumberValid('0152234716')).toBeTruthy();
    expect(await isPhonenumberValid('+49152234716')).toBeTruthy();
    expect(await isPhonenumberValid('+49152 234 716')).toBeTruthy();
    expect(await isPhonenumberValid('+49152-234-716')).toBeTruthy();
    expect(await isPhonenumberValid('+49152.234.716')).toBeTruthy();
    expect(await isPhonenumberValid('02774/3324243')).toBeTruthy();
});
test('phonennumbervalidation finds falsy phonennumbers', async () => {
    expect(await isPhonenumberValid('23480a2938')).toBeFalsy();
    expect(await isPhonenumberValid('29304!123')).toBeFalsy();
    expect(await isPhonenumberValid('23094&234')).toBeFalsy();
});

// Test: isBirthdateValid()
test('datevalidation finds correct dates', async () => {
    expect(await isDateValid('1990-04-12')).toBeTruthy();
    expect(await isDateValid('2023-12-12')).toBeTruthy();
});
test('datevalidation finds falsy dates', async () => {
    expect(await isDateValid('1990-31-31')).toBeFalsy();
    expect(await isDateValid('1990-31')).toBeFalsy();
    expect(await isDateValid('1997-01-5')).toBeFalsy();
    expect(await isDateValid('1997-99-99')).toBeFalsy();
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
