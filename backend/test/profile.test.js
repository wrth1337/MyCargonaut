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

// ich kann hier ja noch gar nicht wirklich was testen wenn man noch keine Fahrzeuge oder Angebote hinzufügen kann und so löl
// is hier aber auch nicht mal der richtige Branch grad, ganz tolle Organistaion Nico Danke

// Test: get profile data from new registered user
test('get profile data from new registered user', async () => {
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

        const dbResult = getUser(email);

        // Expect the user data in the database to match the test data
        expect((await dbResult).data[0].firstName).toBe(firstName);
        /*expect(dbResult[0].lastName).toBe(lastName);
        expect(dbResult[0].birthdate).toBe(birthdate);
        expect(dbResult[0].description).toBe(NULL);
        expect(dbResult[0].experience).toBe(NULL);
        expect(dbResult[0].rating).toBe(NULL);*/

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
