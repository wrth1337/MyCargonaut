const {expect, test, afterAll, beforeAll} = require('@jest/globals');
const mariadb = require('mariadb');
const {registerNewUser} = require('../routes/user');
const {getUserCoins} = require('../routes/coins');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

beforeAll(() => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'mail@mail.de';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';
    registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);
});

test('getUserCoins', async () => {
    const id = 1;
    const result = await getUserCoins(id);
    expect(result.data.coins).toBe(0);

    const conn = await pool.getConnection();
    const deleteQuery = 'DELETE FROM user WHERE userId = ?';
    await conn.query(deleteQuery, [id]);
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
