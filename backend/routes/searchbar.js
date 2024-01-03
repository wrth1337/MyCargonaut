const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');

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

// --- Methods ---
async function getFilteredAds(type, startLocation, endLocation, startDate, freight, numSeats, userRating) {
    let query;
    const filters = [];

    if (startLocation) {
        filters.push(`a.startLocation='${startLocation}' OR i.location='${startLocation}'`);
    }

    if (endLocation) {
        filters.push(`a.endLocation='${endLocation}' OR i.location='${endLocation}'`);
    }

    if (startDate) {
        filters.push(`a.startDate='${startDate}'`);
    }

    if (freight) {
        if (type==='offer') {
            filters.push(`v.loadingAreaDimensions IS NOT NULL`);
        } else if (type==='wanted') {
            filters.push('w.freight IS NOT NULL');
        }
    }

    if (numSeats) {
        filters.push(`a.numSeats>=${numSeats}`);
    }

    const whereClause = filters.length > 0 ? filters.join(' AND ') : '1';

    if (type === 'offer') {
        query = `
            SELECT
                a.adId
            FROM
                ad a
                    JOIN
                offer o ON o.adId = a.adId
                    JOIN
                vehicle v ON o.vehicleId = v.vehicleId
                    JOIN
                user u ON a.userId = u.userId
                    LEFT JOIN
                rating r ON r.userWhoWasEvaluated = u.userId
                    LEFT JOIN
                intermediateGoal i ON i.adId = a.adId
            WHERE
                ${whereClause}
            GROUP BY
                a.adId
        `;
        if (userRating) {
            userRatingFloat = parseFloat(userRating);
            query += `
                 HAVING
                    AVG((r.punctuality + r.agreement + r.pleasent + COALESCE(r.freight, 0)) / 4)>=${userRatingFloat}`;
        } else {
            query += `;`;
        }
    } else if (type === 'wanted') {
        query = `
            SELECT
                a.adId
                FROM
                ad a
                    JOIN
                wanted w ON w.adId = a.adId
                    JOIN
                user u ON a.userId = u.userId
                    JOIN
                rating r ON r.userWhoWasEvaluated = u.userId
                    JOIN
                intermediateGoal i ON i.adId = a.adId
            WHERE
                ${whereClause}
            GROUP BY
                a.adId
        `;
        if (userRating) {
            userRatingFloat = parseFloat(userRating);
            query += `
                 HAVING
                    AVG((r.punctuality + r.agreement + r.pleasent + COALESCE(r.freight, 0)) / 4)>=${userRatingFloat}`;
        } else {
            query += `;`;
        }
    } else {
        throw new Error('Invalid type parameter. Use "offer" or "wanted".');
    }

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(query);
        conn.release();

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// ---- Routes ----
/**
 * @swagger
 * paths:
 *   /search:
 *     get:
 *       summary: Get filtered ads
 *       parameters:
 *         - in: query
 *           name: typ
 *           schema:
 *             type: string
 *           description: Type of ad (offer or wanted)
 *         - in: query
 *           name: startLocation
 *           schema:
 *             type: string
 *           description: Start location filter
 *         - in: query
 *           name: endLocation
 *           schema:
 *             type: string
 *           description: End location filter
 *         - in: query
 *           name: startDate
 *           schema:
 *             type: string
 *           description: Start date filter
 *         - in: query
 *           name: freight
 *           schema:
 *             type: boolean
 *           description: Freight filter
 *         - in: query
 *           name: numSeats
 *           schema:
 *             type: integer
 *           description: Minimum number of seats filter
 *         - in: query
 *           name: userRating
 *           schema:
 *             type: number
 *           description: Minimum user rating filter
 *
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               example:
 *                 adId: 123
 *
 * components:
 *   schemas:
 *     Ad:
 *       type: object
 *       properties:
 *         adId:
 *           type: integer
 */
router.get('/search', async function(req, res, next) {
    const typ = req.query.typ;
    const startLocation = req.query.startLocation;
    const endLocation = req.query.endLocation;
    const startDate = req.query.startDate;
    const freight = req.query.freight;
    const numSeats = req.query.numSeats;
    const userRating = req.query.userRating;
    try {
        const ads = await getFilteredAds(typ, startLocation, endLocation, startDate, freight, numSeats, userRating);
        console.log(ads);
        res.send(ads);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

module.exports = {router, getFilteredAds};
