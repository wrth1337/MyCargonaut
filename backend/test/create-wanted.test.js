const {expect, test, afterAll} = require('@jest/globals');
const {registerNewUser} = require('../routes/user');
const {getUserWanteds, addNewWanted} = require('../routes/wanted');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('create new wanted ad', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);
    expect(result).toBe(0);

    const description = 'testDescription';
    const startLocation = 'testStartLoc';
    const endLocation = 'testEndLoc';
    const startDate = '2024-02-02';
    const endDate = '2024-02-03';
    const animals = true;
    const smoker = true;
    const notes = 'testNote';
    const numSeats = 2;
    const freight = 'testFreight';
    
    let conn;

    try {

        conn = await pool.getConnection();

        const id = await conn.query('SELECT userId FROM user WHERE email = ?', [email]);
        const userId = id[0].userId;

        const res = await addNewWanted(description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId, freight);
        expect(res).toBe(1);

        const dbResult = await getUserWanteds(userId);

        expect(dbResult.data[0].startLocation).toEqual(startLocation);
        expect(dbResult.data[0].endLocation).toEqual(endLocation);
        expect(dbResult.data[0].startDate).toEqual(new Date(startDate));

    } finally {
        if (conn) await conn.release();
    }

    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM user WHERE email = ?', [email]);
    } finally {
        if (conn) await conn.release();
    }
});



afterAll(() => {
    pool.end(err => {
        if (err) {
            console.error('Fehler beim Schließen der Datenbankverbindung:', err);
        } else {
            console.log('Datenbankverbindung erfolgreich geschlossen.');
        }
    });
});
