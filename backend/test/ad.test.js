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

        conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                VALUES (10,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 1)`);
        conn.query(`INSERT INTO offer (offerId, vehicleId, adId, pricePerPerson, pricePerFreight) \
                VALUES (10, 1, 10, 50.0, 100.0)`);
        const res = (await ad.getAdById(10));
        expect(res.data.result[0]).toEqual(
            {
                'adId': 10,
                'description': 'Ja Beschreibung halt so lololol',
                'startLocation': 'City A',
                'endLocation': 'City B',
                'type': 'offer',
                'intermediateGoals': [],
                'startDate': new Date('2023-01-09T23:00:00.000Z'),
                'endDate': new Date('2023-01-14T23:00:00.000Z'),
                'animals': 0,
                'smoker': 1,
                'notes': 'No pets allowed',
                'numSeats': 4,
                'active': 1,
                'userId': 1,
            });
    } finally {
        conn.query(`DELETE FROM ad WHERE adId = 10`);
        conn.query(`DELETE FROM offer WHERE offerId = 10`);
        if (conn) await conn.release();
    };
});

test('get ad by wrong Id', async () =>{
    const res2 = await ad.getAdById(99999999999999999);
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