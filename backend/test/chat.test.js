const {expect, test, afterAll} = require('@jest/globals');
const {addMessage, getLastMessages} = require('../routes/chat');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('addMessage: add a message', async () =>{
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM user WHERE userId = 100');
        await conn.query('DELETE FROM user WHERE userId = 101');
        // eslint-disable-next-line max-len
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) VALUES (100,'MaxChat', 'Mustermann', 'maxChat@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);
        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId)
            VALUES (100,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 100)`);
        await conn.query(`INSERT INTO vehicle (vehicleId, name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeatures, userId)
            VALUES (100,'Car1', 4, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 100)`);
        await conn.query(`INSERT INTO offer (offerId, vehicleId, adId, pricePerPerson, pricePerFreight)
            VALUES (100, 100, 100, 50.0, 100.0)`);

        await addMessage(100, 100, 'This is a testmessage');
        let result = await conn.query('SELECT messageText FROM message WHERE userId = 100');
        expect(result[0].messageText).toBe('This is a testmessage');
        await conn.query('DELETE FROM message WHERE adId = 100');
        // eslint-disable-next-line max-len
        const longmessage = 'This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message. This is a long message.';
        await addMessage(100, 100, longmessage);
        result = await conn.query('SELECT messageText FROM message WHERE userId = 100');
        expect(result[0].messageText).toBe(longmessage);
    } finally {
        await conn.query('DELETE FROM message WHERE adId = 100');
        await conn.query(`DELETE FROM ad WHERE adId = 100`);
        await conn.query(`DELETE FROM offer WHERE offerId = 100`);
        await conn.query(`DELETE FROM vehicle WHERE vehicleId = 100`);
        await conn.query(`DELETE FROM user WHERE userId = 100`);
        if (conn) await conn.end();
    }
});

test('getLastMessages: Receive all messages', async () =>{
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience)
            VALUES (100,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience)
            VALUES (101,'Tim', 'Mustermann', 'tim@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);
        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId)
            VALUES (100,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 100)`);
        await conn.query(`INSERT INTO vehicle (vehicleId, name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeatures, userId)
            VALUES (100,'Car1', 4, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 100)`);
        await conn.query(`INSERT INTO offer (offerId, vehicleId, adId, pricePerPerson, pricePerFreight)
            VALUES (100, 100, 100, 50.0, 100.0)`);

        await addMessage(100, 100, 'Message 1 from 100');
        await addMessage(101, 100, 'Message 2 from 101');
        await addMessage(100, 100, 'Message 3 from 100');
        await addMessage(101, 100, 'Message 4 from 101');

        const result = await getLastMessages(100);
        expect(result[0].messageText).toBe('Message 1 from 100');
        expect(result[0].adId).toBe(100);
        expect(result[0].userId).toBe(100);

        expect(result[1].messageText).toBe('Message 2 from 101');
        expect(result[1].adId).toBe(100);
        expect(result[1].userId).toBe(101);

        expect(result[2].messageText).toBe('Message 3 from 100');
        expect(result[2].adId).toBe(100);
        expect(result[2].userId).toBe(100);

        expect(result[3].messageText).toBe('Message 4 from 101');
        expect(result[3].adId).toBe(100);
        expect(result[3].userId).toBe(101);
    } finally {
        conn.query('DELETE FROM message WHERE adId = 100');
        conn.query(`DELETE FROM ad WHERE adId = 100`);
        conn.query(`DELETE FROM offer WHERE offerId = 100`);
        conn.query(`DELETE FROM vehicle WHERE vehicleId = 100`);
        conn.query(`DELETE FROM user WHERE userId = 100`);
        conn.query(`DELETE FROM user WHERE userId = 101`);

        if (conn) await conn.end();
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
