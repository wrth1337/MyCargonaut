const {expect, test, afterAll} = require('@jest/globals');
const {registerNewUser} = require('../routes/user');
const {getUser} = require('../routes/profile');
const {getUserOffers} = require('../routes/offer');
const {getUserTrips} = require('../routes/trip');
const {getUserVehicles} = require('../routes/vehicle');
const {getUserWanteds} = require('../routes/wanted');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('get profile data from new registered user', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    let conn;

    try {
        const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

        expect(result).toBe(0);

        conn = await pool.getConnection();

        const dbResult = getUser(email);

        expect((await dbResult).data[0].firstName).toBe(firstName);
        /*expect(dbResult[0].lastName).toBe(lastName);
        expect(dbResult[0].birthdate).toBe(birthdate);
        expect(dbResult[0].description).toBe(NULL);
        expect(dbResult[0].experience).toBe(NULL);
        expect(dbResult[0].rating).toBe(NULL);*/

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
