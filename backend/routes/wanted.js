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

async function getUserWanteds(id) {
    const userWanted = 'SELECT a.startLocation, a.endLocation, a.startDate FROM ad a JOIN wanted w ON w.adId = a.adId JOIN booking b ON b.adId = a.adId JOIN status s ON s.bookingId = b.bookingId WHERE s.endRide = FALSE AND a.userId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(userWanted, [id]);
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

async function addNewWanted(description, startLocation, endLocation, startDate, endDate, animals, smoker, price, notes, numSeats, userId, freight) {
    const addWantedAd = 'INSERT INTO ad (description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?,?)';
    const addWanted = 'INSERT INTO wanted (adId, price, freight) VALUES (LAST_INSERT_ID(), ?, ?)';
    const addBooking = 'INSERT INTO booking (adId, userId, price, numSeats) VALUES (?,?,0.0,0)';
    const addStatus = 'INSERT INTO status (bookingId) VALUES (LAST_INSERT_ID())';

    try {
        const conn = await pool.getConnection();
        const resA = await conn.query(addWantedAd, [description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId]);
        const adId = resA.insertId;
        await conn.query(addWanted, [price, freight]);
        await conn.query(addBooking, [adId, userId]);
        await conn.query(addStatus, []);
        await conn.release();
        return 1;
    } catch (error) {
        return 0;
    }
}

async function getWantedById(id) {
    const query = 'SELECT * FROM wanted WHERE adId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(query, id);
        await conn.release();

        if (result.length > 0) {
            return {success: true, data: result[0]};
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
 *      - name: wanted
 *        description: Routes that are connected to the wanteds of an user
 * /wanted/getUserWanted:
 *      get:
 *          summary: get user wanteds.
 *          security:
 *              - bearerAuth: []
 *          description: get a list of the user wanteds.
 *          tags:
 *              - wanted
 *          responses:
 *              200:
 *                  description: user wanted data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  wantedData:
 *                                      type: array
 *                                      description: The user wanted ad data.
 *                                      items:
 *                                        $ref: '#/components/schemas/wanted_ad'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * components:
 *      schemas:
 *          wanted_ad:
 *              type: object
 *              properties:
 *                  startLocation:
 *                      type: string
 *                      description: The start location of the wanted.
 *                  endLocation:
 *                      type: string
 *                      description: The end location of the wanted.
 *                  startDate:
 *                      type: string
 *                      format: date
 *                      description: The start date of the wanted.
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 * security:
 *  - bearerAuth: []
 */
router.get('/getUserWanted', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        const wanted = await getUserWanteds(id);
  
        if (wanted.success) {
            res.status(200);
            res.json({status: 1, wantedData: wanted.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Wanted Data failed'});
    }
});

/**
 * @swagger
 * tags:
 *      - name: wanted
 *        description: Routes that are connected to the wanted ads of an user.
 * /wanted/create_wanted:
 *    post:
 *         summary: Create a new wanted ad.
 *         security:
 *             - bearerAuth: []
 *         description: Create a new wanted ad.
 *         tags:
 *             - wanted
 *         requestBody:
 *              description: The data of the new wanted ad.
 *              content:
 *                    application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - description
 *                              - startLocation
 *                              - endLocation
 *                              - startDate
 *                              - endDate
 *                              - animals
 *                              - smoker
 *                              - notes
 *                              - numSeats
 *                              - freight
 *                          properties:
 *                              description:
 *                                  type: string
 *                                  description: The description of the ad.
 *                                  example: example description
 *                              startLocation:
 *                                  type: string
 *                                  description: The start location of the ad.
 *                                  example: Town A
 *                              endLocation:
 *                                  type: string
 *                                  description: The end location of the ad.
 *                                  example: Town B
 *                              startDate:
 *                                  type: string
 *                                  description: The start date of the ad.
 *                                  example: '2024-01-01'
 *                                  format: date
 *                              endDate:
 *                                  type: string
 *                                  description: The end date of the ad.
 *                                  example: '2024-01-02'
 *                                  format: date
 *                              animals:
 *                                  type: boolean
 *                                  description: The preference for animals.
 *                                  example: true
 *                              smoker:
 *                                  type: boolean
 *                                  description: The preference for smokers.
 *                                  example: false
 *                              notes:
 *                                  type: string
 *                                  description: The notes of the ad.
 *                                  example: example notes
 *                              numSeats:
 *                                  type: number
 *                                  description: The amount of the required seats.
 *                                  example: 2
 *                              freight:
 *                                  type: string
 *                                  description: The freight of the ad.
 *                                  example: example freight
 *         responses:
 *              200:
 *                  description: creating new wanted ad was successful.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *              500:
 *                  description: creating new wanted ad failed.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 * components:
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 * security:
 *  - bearerAuth: []
 */
router.post('/create_wanted', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        const {description, startLocation, endLocation, startDate, endDate, animals, smoker, price, notes, numSeats, freight} = req.body;
        const wanted = await addNewWanted(description, startLocation, endLocation, startDate, endDate, animals, smoker, price, notes, numSeats, id, freight);

        if (wanted === 1) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 0});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Creating Wanted Ad failed'});
    }
});
  
/**
 * @swagger
 * tags:
 *      - name: wanted
 *        description: Routes that are connected to the wanteds of an user
 * /wanted/wanted/{adId}:
 *      get:
 *          summary: get wanted data by adId.
 *          security:
 *              - bearerAuth: []
 *          description: get the wanted data for a specified ad.
 *          tags:
 *              - wanted
 *
 *          parameters:
 *              - in: path
 *                name: adId
 *                required: true
 *                schema:
 *                  type: number
 *                description: AdId the wanted data is connected to.
 *                example: 1
 *
 *          responses:
 *              200:
 *                  description: wanted data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  data:
 *                                      $ref: '#/components/schemas/wanted'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * components:
 *      schemas:
 *          wanted:
 *              type: object
 *              properties:
 *                  adId:
 *                      type: number
 *                      description: Id of the connected ad
 *                  freight:
 *                      type: string
 *                      description: Description of the freight
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 * security:
 *  - bearerAuth: []
 */
router.get('/wanted/:id', async function(req, res, next) {
    try {
        const wanted = await getWantedById(req.params.id);

        if (wanted.success) {
            res.status(200);
            res.json({status: 1, data: wanted.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching wanted Data failed'});
    }
});


module.exports = {router, getUserWanteds, getWantedById, addNewWanted};
