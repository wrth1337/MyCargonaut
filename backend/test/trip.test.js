const {expect, test, afterAll} = require('@jest/globals');
const {registerNewUser} = require('../routes/user');
const {getTripCount} = require('../routes/trip');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('get correct amount of trip of a new user', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);
    expect(result).toBe(0);

    let conn;

    try {
        conn = await pool.getConnection();

        const id = await conn.query('SELECT userId FROM user WHERE email = ?', [email]);
        const userId = id[0].userId;

        const dbResult = await getTripCount(userId);

        expect(dbResult.data.length).toBe(0);
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
    pool.end((err) => {
        if (err) {
            console.error('Fehler beim Schließen der Datenbankverbindung:', err);
        } else {
            console.log('Datenbankverbindung erfolgreich geschlossen.');
        }
    });
});
