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
            return {success: false, data: []};
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function getTripCount(id) {
    const trips = `SELECT a.adId FROM ad a JOIN booking b ON b.adId = a.adId
    WHERE (a.state != 'created' AND a.userId = ?) OR (b.userId = ?  AND b.canceled = FALSE AND b.state = 'confirmed')`;
    try {
        const conn = await pool.getConnection();
        const tripCount = await conn.query(trips, [id, id]);
        await conn.release();
        if (tripCount.length > 0) {
            return {success: true, data: tripCount};
        } else {
            return {success: true, data: []};
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

router.get('/', authenticateToken, async function(req, res, next) {
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

/**
 * @swagger
 * tags:
 *      - name: getTripCount
 *        description: Route that gets all trips by user id.
 * /trip/getTripCount/{userId}:
 *      get:
 *          summary: get user trips.
 *          description: get all of the user trips.
 *          tags:
 *              - trip
 *          parameters:
 *              - in: path
 *                name: userId
 *                required: true
 *                schema:
 *                  type: number
 *                description: The id of the current user.
 *                example: 1
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
 *                                  data:
 *                                      type: array
 *                                      description: The user trip data.
 *                                      items:
 *                                        $ref: '#/components/schemas/trip'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * components:
 *      schemas:
 *          trip:
 *              type: object
 *              properties:
 *                  adId:
 *                      type: number
 *                      description: The id of the ad connected to the trip.
 */
router.get('/getTripCount/:id', async function(req, res, next) {
    try {
        const trip = await getTripCount(req.params.id);
        if (trip.success) {
            res.status(200);
            res.json({status: 1, data: trip.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Trip Count failed'});
    }
});


module.exports = {router, getUserTrips, getTripCount};
