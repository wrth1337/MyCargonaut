const {expect, test, afterAll} = require('@jest/globals');
const { saveNewRating, isRatingAlreadyDone} = require('../routes/rating');
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