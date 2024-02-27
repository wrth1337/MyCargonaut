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
    const userWantedTrips = `
    SELECT a.startLocation, a.endLocation, a.startDate
    FROM ad a 
        JOIN wanted w ON w.adId = a.adId 
        JOIN booking b ON b.adId = a.adId 
        JOIN status s ON s.bookingId = b.bookingId 
    WHERE s.endRide = TRUE AND a.userId = ?`;

    const userOfferedTrips = `
    SELECT a.startLocation, a.endLocation, a.startDate
    FROM ad a 
        JOIN offer o ON o.adId = a.adId
        JOIN booking b ON b.adId = a.adId
        JOIN status s ON s.bookingId = b.bookingId 
    WHERE s.endRide = TRUE AND a.userId = ?`;

    try {
        const conn = await pool.getConnection();
        const uwtresult = await conn.query(userWantedTrips, [id]);
        const uotresult = await conn.query(userOfferedTrips, [id]);
        await conn.release();
        if (uwtresult.length > 0 || uotresult.length > 0) {
            return {success: true, uwtdata: uwtresult, uotData: uotresult};
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
 *          security:
 *              - bearerAuth: []
 *          tags:
 *              - trip
 *          parameters:
 *              - in: query
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
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 * security:
 *  - bearerAuth: []
 */

router.get('/trip', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        const trip = await getUserTrips(id);

        if (trip.success) {
            res.status(200);
            res.json({status: 1, uwtData: trip.uwtdata, uotData: trip.uotData});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Trip Data failed'});
    }
});


module.exports = {router, getUserTrips};
