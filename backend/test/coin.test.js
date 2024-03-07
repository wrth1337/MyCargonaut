const {expect, test, afterAll} = require('@jest/globals');
const mariadb = require('mariadb');
const {registerNewUser} = require('../routes/user');
const {getUserCoins} = require('../routes/coins');
const {addUserCoins} = require('../routes/coins');
const {subtractUserCoins} = require('../routes/coins');

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
    try {
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
    } finally {
        const conn = await pool.getConnection();
        const deleteQuery = 'DELETE FROM user WHERE userId = ?';
        await conn.query(deleteQuery, [await getUserID('mail@mail.de')]);
    }
});

test('addUserCoins with invalid user id', async () => {
    const invalidId = 99999;
    const coinsToAdd = 10;
    const result = await addUserCoins(invalidId, coinsToAdd);

    expect(result.success).toBe(false);
});

test('subtractUserCoins with invalid user id', async () => {
    const invalidId = 99999;
    const coinsToSubtract = 5;
    const result = await subtractUserCoins(invalidId, coinsToSubtract);

    expect(result.success).toBe(false);
});

test('addUserCoins', async () => {
    try {
        const firstName = 'testFirstName';
        const lastName = 'testLastName';
        const email = 'mail@mail.de';
        const password = 'testPassword';
        const birthdate = '1990-01-01';
        const phonenumber = '1234567890';
        await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

        const id = await getUserID(email);
        const coinsToAdd = 10;
        await addUserCoins(id, coinsToAdd);

        const result = await getUserCoins(id);

        expect(result.data).toBe(coinsToAdd);
    } finally {
        const conn = await pool.getConnection();
        const deleteQuery = 'DELETE FROM user WHERE userId = ?';
        await conn.query(deleteQuery, [await getUserID('mail@mail.de')]);
    }
});

test('subtractUserCoins', async () => {
    try {
        const firstName = 'testFirstName';
        const lastName = 'testLastName';
        const email = 'mail@mail.de';
        const password = 'testPassword';
        const birthdate = '1990-01-01';
        const phonenumber = '1234567890';
        await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

        const id = await getUserID(email);
        const coinsToAdd = 10;
        await addUserCoins(id, coinsToAdd);

        const coinsToSubtract = 5;
        await subtractUserCoins(id, coinsToSubtract);

        const result = await getUserCoins(id);

        expect(result.data).toBe(coinsToAdd - coinsToSubtract);
    } finally {
        const conn = await pool.getConnection();
        const deleteQuery = 'DELETE FROM user WHERE userId = ?';
        await conn.query(deleteQuery, [await getUserID('mail@mail.de')]);
    }
});

test('subtractUserCoins with not enough coins', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'mailCoin@mail.de';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';
    await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);
    const id = await getUserID(email);
    const coinsToAdd = 10;
    await addUserCoins(id, coinsToAdd);
    const coinsToSubtract = 15;
    const result = await subtractUserCoins(id, coinsToSubtract);
    expect(result.success).toBe(false);
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
