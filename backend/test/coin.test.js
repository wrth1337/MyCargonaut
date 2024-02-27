const {expect, test, afterAll} = require('@jest/globals');
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

async function getUserID(email) {
    const conn = await pool.getConnection();
    const idQuery = 'SELECT userId FROM user WHERE email = ?';
    const result = await conn.query(idQuery, [email]);
    return result[0].userId;
}

test('getUserCoins', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'mail@mail.de';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';
    await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

    const id = await getUserID(email);
    const result = await getUserCoins(id);

    expect(result.data).toBe(0);

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
