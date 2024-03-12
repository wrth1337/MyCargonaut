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
        // eslint-suppress-next-line max-len
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) VALUES (123456789,'MaxBooking', 'MustermannBooking', 'maxBoocking@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        // eslint-suppress-next-line max-len
        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);
        const res = await booking.newBooking(123456789, 123456789, 10, 1);
        expect(res.affectedRows).toEqual(1);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 123456789`);
        conn.query(`DELETE FROM ad WHERE adId = 123456789`);

        if (conn) await conn.release();
    }
});
test('If getSeatsAvailable get the correct amount of seats', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        // eslint-suppress-next-line max-len
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) VALUES (123456789,'MaxBookingA', 'MustermannBookingB', 'maxBoockingC@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        // eslint-suppress-next-line max-len
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) VALUES (12345678,'MaxBookingC', 'MustermannBookingC', 'maxBoockingC@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        // eslint-suppress-next-line max-len
        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        const booking1 = await booking.newBooking(123456789, 123456789, 10, 1);
        const booking2 = await booking.newBooking(123456789, 12345678, 10, 1);
        await booking.confirmBooking(booking1.insertId, 'confirmed');
        await booking.confirmBooking(booking2.insertId, 'confirmed');
        const res = await booking.getSeatsAvailable(123456789);

        expect(res).toBe(2);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 123456789`);
        conn.query(`DELETE FROM user WHERE userId = 12345678`);
        conn.query(`DELETE FROM ad WHERE adId = 123456789`);

        if (conn) await conn.release();
    }
});

test('If a booking is canceled correctly', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (123456789,'MaxBookingD', 'MustermannBookingD', 'maxBoockingD@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                    VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        const bookingResult = await booking.newBooking(123456789, 123456789, 10, 1);
        expect((await booking.getBookingsByAd(123456789))[0].canceled).toEqual(0);
        const res = await booking.cancelBooking(bookingResult.insertId, 123456789);
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

        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (12345678,'Max1', 'Mustermann1', 'max1@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (1234567,'Max2', 'Mustermann2', 'max2@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                    VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                    VALUES (12345678,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        await booking.newBooking(123456789, 123456789, 10, 1);
        await booking.newBooking(12345678, 123456789, 10, 1);
        await booking.newBooking(123456789, 12345678, 10, 1);
        await booking.newBooking(123456789, 1234567, 10, 1);

        const res = await booking.getBookingsByAd(123456789);
        const res2 = await booking.getBookings(123456789);

        expect(res.length).toBe(3);
        expect(res2.length).toBe(2);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 123456789`);
        conn.query(`DELETE FROM user WHERE userId = 12345678`);
        conn.query(`DELETE FROM user WHERE userId = 1234567`);

        conn.query(`DELETE FROM ad WHERE adId = 123456789`);
        conn.query(`DELETE FROM ad WHERE adId = 12345678`);
        if (conn) await conn.release();
    }
});

test('If confirming a booking works', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (123456789,'MaxBooking', 'MustermannBooking', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
                    VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        const bookingRes = await booking.newBooking(123456789, 123456789, 10, 1);
        const result = await booking.confirmBooking(bookingRes.insertId);

        expect(result.affectedRows).toBe(1);
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
