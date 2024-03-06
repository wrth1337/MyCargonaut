const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');
const authenticateToken = require('./auth');

// eslint-disable-next-line new-cap
const router = express.Router();
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
});

router.use(limiter);

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

// ---Methods--- //
async function saveNewRating(bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) {
    const newRating = `INSERT INTO rating (bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
        const conn = await pool.getConnection();
        // eslint-disable-next-line no-unused-vars
        const result = await conn.query(newRating, [bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment]);
        await conn.release();
        return 0;
    } catch (error) {
        console.error(error);
        return 1;
    }
}

async function isRatingAlreadyDone(bookingId, userId) {
    const checkRatingExists = `SELECT COUNT(*) AS count FROM rating WHERE bookingId = ? AND userWhoIsEvaluating = ?`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(checkRatingExists, [bookingId, userId]);
        await conn.release();
        return (result[0].count > 0);
    } catch (error) {
        console.error(error);
        throw error;
    }
}
// ---Routes--- //

router.post('/rating', authenticateToken, async function(req, res, next) {
    const bookingId = req.body.bookingId;
    const userId = req.user_id;
    const rating = req.body;
    const {userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment} = rating;

    const conn = await pool.getConnection();
    try {
        const ratingExists = await isRatingAlreadyDone(bookingId, userId);
        if (ratingExists) {
            res.status(409);
            res.send({status: 1, msg: 'Your already rated this ride.'});
        } else {
            // eslint-disable-next-line no-unused-vars
            const newRating = await saveNewRating(bookingId, userId, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment);
            res.status(201);
            res.send({status: 0, msg: 'Rating created'});
        }
    } catch (error) {
        res.status(500);
        res.send({status: 500, error: 'Rating couldn´t be saved in db'});
    } finally {
        if (conn) await conn.release();
    }
});

router.get('/rating/done/:id', authenticateToken, async function(req, res, next) {
    const bookingId = req.params.id;
    const userId = req.user_id;

    const conn = await pool.getConnection();
    try {
        const ratingExists = await isRatingAlreadyDone(bookingId, userId);
        res.status(200);
        res.send({status: 0, ratingDone: ratingExists});
    } catch (error) {
        res.status(500);
        res.send({status: 500, error: 'Internal Server error'});
    } finally {
        if (conn) await conn.release();
    }
});

module.exports = {router, saveNewRating, isRatingAlreadyDone};