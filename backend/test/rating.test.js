const {expect, test, afterAll} = require('@jest/globals');
const { saveNewRating, isRatingAlreadyDone, getRatingsByUserId} = require('../routes/rating');
const {newBooking} = require('../routes/booking');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('add new rating in database via backend', async () => {
    const bookingId = 1000;
    const userWhoIsEvaluating = 1001;
    const userWhoWasEvaluated = 2002;
    const punctuality = 4;
    const agreement = 5;
    const pleasent = 4;
    const freight = 3;
    const comment = 'Sehr schöne Fahrt';

    let conn;

    try {
        // Call the function with test data
        const result = await saveNewRating(bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment);
        // Expect the function to return 0 (success)
        expect(result).toBe(0);

        // Verify the rating is in the database
        conn = await pool.getConnection();
        const dbResult = await conn.query('SELECT * FROM rating WHERE bookingId = ? AND userWhoIsEvaluating = ? AND userWhoWasEvaluated = ?', [bookingId, userWhoIsEvaluating, userWhoWasEvaluated]);

        // Expect the user data in the database to match the test data
        expect(dbResult[0].bookingId).toBe(bookingId);
        expect(dbResult[0].userWhoIsEvaluating).toBe(userWhoIsEvaluating);
        expect(dbResult[0].userWhoWasEvaluated).toBe(userWhoWasEvaluated);
    } finally {
        if (conn) await conn.release();
    }

    try {
        // Clean up the test data from the database
        conn = await pool.getConnection();
        await conn.query('DELETE FROM rating WHERE bookingId = ? AND userWhoIsEvaluating = ? AND userWhoWasEvaluated = ?', [bookingId, userWhoIsEvaluating, userWhoWasEvaluated]);
    } finally {
        if (conn) await conn.release();
    }
});

test('Get all ratings for one User', async () => {
    const punctuality = 4;
    const agreement = 5;
    const pleasent = 4;
    const freight = 3;
    const comment = 'Sehr schöne Fahrt';

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (999999,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (999998,'Max1', 'Mustermann1', 'max1@example.com', 'pass1231', '1990-05-15', '123456789', 100.0, 'user2.jpg', 'Hi was geht so1', 'Viel Erfahrung1')`);
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (999997,'Max2', 'Mustermann2', 'max2@example.com', 'pass1232', '1990-05-15', '123456789', 100.0, 'user3.jpg', 'Hi was geht so2', 'Viel Erfahrung2')`);

        await conn.query(`INSERT INTO ad (adId,description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) \
        VALUES (123456789,'Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 123456789)`);

        const bookingRes = await newBooking(123456789, 123456789, 10, 1);
        await saveNewRating(bookingRes.insertId, 999999, 999998, punctuality, agreement, pleasent, freight, comment);

        const res = await getRatingsByUserId(999998);
        expect(res.length).toBe(1);
        const res2 = await getRatingsByUserId(999998);
        await saveNewRating(bookingRes.insertId, 999997, 999998, punctuality, agreement, pleasent, freight, comment);
        expect(res2.length).toBe(2);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 999999`);
        conn.query(`DELETE FROM user WHERE userId = 999998`);

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