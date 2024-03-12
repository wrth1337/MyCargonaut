const {expect, test, afterAll} = require('@jest/globals');
const wanted = require('../routes/wanted');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('get wanted by correct Id', async () =>{
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
                VALUES (101337,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);
        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                VALUES (101337,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 10)`);
        await conn.query(`INSERT INTO wanted (wantedId, adId, freight) \
                VALUES (101337, 10, 'Freight')`);
        const res = (await wanted.getWantedById(101337));
        expect(res.data).toEqual(
            {
                'wantedId': 101337,
                'adId': 101337,
                'freight': 'Freight',
            });
    } finally {
        conn.query(`DELETE FROM ad WHERE adId = 10`);
        conn.query(`DELETE FROM wanted WHERE wantedId = 10`);
        conn.query(`DELETE FROM user WHERE userId = 10`);
        if (conn) await conn.release();
    };
});

test('get wanted by wrong Id', async () =>{
    const res2 = await wanted.getWantedById(99999999999999999);
    expect(res2).toEqual({success: false});
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
