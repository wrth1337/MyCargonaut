const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');
const authenticateToken = require('./auth');

// eslint-disable-next-line new-cap
const router = express.Router();
const limiter = rateLimit({
    windowMs: 60 * 1000,
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

async function getUserTrips(id) {
    const userTrips = `
    SELECT a.startLocation, a.endLocation, a.startDate
    FROM ad a 
        JOIN booking b ON b.adId = a.adId
    WHERE (a.state != 'created' AND a.userId = ?) OR (b.userId = ?  AND b.canceled = FALSE AND b.state = 'confirmed')`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(userTrips, [id, id]);
        await conn.release();
        if (result.length > 0) {
            return {success: true, data: result};
        } else {
            return {success: false};
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

// ---Routes--- //
/**
 * @swagger
 * tags:
 *      - name: trip
 *        description: Routes that are connected to the trips of an user
 * /trip:
 *      get:
 *          summary: get user trips.
 *          description: get a list of the user trips.
 *          tags:
 *              - trip
 *          parameters:
 *              - in: query
 *                name: email
 *                required: true
 *                schema:
 *                  type: string
 *                description: The email of the current user.
 *                example: max@example.com
 *          responses:
 *              200:
 *                  description: user trip data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  uwtData:
 *                                      type: array
 *                                      description: The user wanted trip data.
 *                                      items:
 *                                        $ref: '#/components/schemas/wantedTrip'
 *                                  uotData:
 *                                      type: array
 *                                      description: The user offered trip data.
 *                                      items:
 *                                        $ref: '#/components/schemas/offeredTrip'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * components:
 *      schemas:
 *          offeredTrip:
 *              type: object
 *              properties:
 *                  startLocation:
 *                      type: string
 *                      description: The start location of the offered trip.
 *                  endLocation:
 *                      type: string
 *                      description: The end location of the offered trip.
 *                  startDate:
 *                      type: string
 *                      format: date
 *                      description: The start date of the offered trip.
 *          wantedTrip:
 *              type: object
 *              properties:
 *                  startLocation:
 *                      type: string
 *                      description: The start location of the wanted trip.
 *                  endLocation:
 *                      type: string
 *                      description: The end location of the wanted trip.
 *                  startDate:
 *                      type: string
 *                      format: date
 *                      description: The start date of the wanted trip.
 */

router.get('/trip', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        const trip = await getUserTrips(id);

        if (trip.success) {
            res.status(200);
            res.json({status: 1, tripData: trip.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Trip Data failed'});
    }
});


module.exports = {router, getUserTrips};
