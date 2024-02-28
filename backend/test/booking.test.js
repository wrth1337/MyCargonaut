const {expect, test, afterAll} = require('@jest/globals');
const booking = require('../routes/booking');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('If newBooking updates the booking table correctly', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (123456789,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                    VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);
        const res = await booking.newBooking(123456789, 123456789, 10, 1);
        expect(res.affectedRows).toEqual(1);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 123456789`);
        conn.query(`DELETE FROM ad WHERE adId = 123456789`);

        if (conn) await conn.release();
    }
});

test('If newBooking updates the booking table correctly if their are to few seats left', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (123456789,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                    VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        await booking.newBooking(123456789, 123456789, 10, 1);
        await booking.newBooking(123456789, 123456789, 10, 1);
        const res = await booking.newBooking(123456789, 123456789, 10, 99);

        expect(res).toEqual(false);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 123456789`);
        conn.query(`DELETE FROM ad WHERE adId = 123456789`);

        if (conn) await conn.release();
    }
});

test('If a booking is canceled correctly', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (123456789,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                    VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        const tmp = await booking.newBooking(123456789, 123456789, 10, 1);
        expect((await booking.getBookingsByAd(123456789))[0].canceled).toEqual(0);
        const res = await booking.cancelBooking(tmp.insertId, 123456789);
        const res2 = (await booking.getBookingsByAd(123456789))[0];
        expect(res.affectedRows).toEqual(1);
        expect(res2.canceled).toBe(1);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 123456789`);
        conn.query(`DELETE FROM ad WHERE adId = 123456789`);

        if (conn) await conn.release();
    }
});

test('If get bookings are working correctly', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (123456789,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                    VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        await booking.newBooking(123456789, 123456789, 10, 1);
        await booking.newBooking(123456789, 123456789, 10, 1);
        await booking.newBooking(123456789, 123456789, 10, 1);

        const res = await booking.getBookingsByAd(123456789);
        const res2 = await booking.getBookings(123456789);

        expect(res.length).toBe(3);
        expect(res2.length).toBe(3);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 123456789`);
        conn.query(`DELETE FROM ad WHERE adId = 123456789`);

        if (conn) await conn.release();
    }
});

test('If new status entries are generated correctly', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (123456789,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                    VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        const result = await booking.newBooking(123456789, 123456789, 10, 1);
        const res = await booking.newStatus(result.insertId);

        expect(res.affectedRows).toBe(1);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 123456789`);
        conn.query(`DELETE FROM ad WHERE adId = 123456789`);

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
