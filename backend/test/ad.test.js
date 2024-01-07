const {expect, test, afterAll} = require('@jest/globals');
const ad = require('../routes/ad');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});
test('get ad by correct Id', async () =>{
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
                VALUES (10,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);
        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                VALUES (10,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 10)`);
        await conn.query(`INSERT INTO vehicle (vehicleId, name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeautures, userId) \
                VALUES (10,'Car1', 4, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 10)`);
        await conn.query(`INSERT INTO offer (offerId, vehicleId, adId, pricePerPerson, pricePerFreight) \
                VALUES (10, 10, 10, 50.0, 100.0)`);
        const res = (await ad.getAdById(10));
        expect(res.data).toEqual(
            {
                'adId': 10,
                'description': 'Ja Beschreibung halt so lololol',
                'startLocation': 'City A',
                'endLocation': 'City B',
                'type': 'offer',
                'intermediateGoals': [],
                'startDate': new Date('2023-01-10'),
                'endDate': new Date('2023-01-15'),
                'animals': 0,
                'smoker': 1,
                'notes': 'No pets allowed',
                'numSeats': 4,
                'picture': null,
                'active': 1,
                'userId': 10,
            });
    } finally {
        conn.query(`DELETE FROM ad WHERE adId = 10`);
        conn.query(`DELETE FROM offer WHERE offerId = 10`);
        conn.query(`DELETE FROM vehicle WHERE vehicleId = 10`);
        conn.query(`DELETE FROM user WHERE userId = 10`);
        if (conn) await conn.release();
    };
});

test('get ad by wrong Id', async () =>{
    const res2 = await ad.getAdById(99999999999999999);
    expect(res2).toEqual({success: false});
});

test('get offer by correct Id', async () =>{
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
                VALUES (10,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);
        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                VALUES (10,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 10)`);
        await conn.query(`INSERT INTO vehicle (vehicleId, name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeautures, userId) \
                VALUES (10,'Car1', 4, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 10)`);
        await conn.query(`INSERT INTO offer (offerId, vehicleId, adId, pricePerPerson, pricePerFreight) \
                VALUES (10, 10, 10, 50.0, 100.0)`);
        const res = (await ad.getOfferById(10));
        expect(res.data).toEqual(
            {
                'offerId': 10,
                'vehicleId': 10,
                'adId': 10,
                'pricePerPerson': 50.0,
                'pricePerFreight': 100.0,
            });
    } finally {
        conn.query(`DELETE FROM ad WHERE adId = 10`);
        conn.query(`DELETE FROM offer WHERE offerId = 10`);
        conn.query(`DELETE FROM vehicle WHERE vehicleId = 10`);
        conn.query(`DELETE FROM user WHERE userId = 10`);
        if (conn) await conn.release();
    };
});

test('get offer by wrong Id', async () =>{
    const res2 = await ad.getOfferById(99999999999999999);
    expect(res2).toEqual({success: false});
});

test('get wanted by correct Id', async () =>{
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
                VALUES (10,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);
        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                VALUES (10,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 10)`);
        await conn.query(`INSERT INTO wanted (wantedId, adId, freight) \
                VALUES (10, 10, 'Freight')`);
        const res = (await ad.getWantedById(10));
        expect(res.data).toEqual(
            {
                'wantedId': 10,
                'adId': 10,
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
    const res2 = await ad.getWantedById(99999999999999999);
    expect(res2).toEqual({success: false});
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