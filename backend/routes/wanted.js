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
    const userWanted = `
    SELECT a.adId, a.startLocation, a.endLocation, a.startDate
    FROM ad a
        JOIN wanted w ON w.adId = a.adId
    WHERE a.state = 'created' AND a.userId = ?`;

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

async function addNewWanted(description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId, freight) {
    const addWantedAd = `
    INSERT INTO ad (description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId)
    VALUES (?,?,?,?,?,?,?,?,?,?)`;

    const addWanted = 'INSERT INTO wanted (adId, freight) VALUES (LAST_INSERT_ID(), ?)';

    try {
        const conn = await pool.getConnection();
        await conn.query(addWantedAd, [description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId]);
        await conn.query(addWanted, [freight]);
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
 * /wanted/:id:
 *      get:
 *          summary: get wanted data by adId.
 *          description: get the wanted data for a specified ad.
 *          tags:
 *              - wanted
 *
 *          parameters:
 *              - in: query
 *                name: id
 *                required: true
 *                schema:
 *                  type: number
 *                description: AdId the wanted data is connected to.
 *                example: 2
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
 * /wanted/getUserWanted/{userId}:
 *      get:
 *          summary: get user wanteds by user Id.
 *          description: get a list of the user wanteds.
 *          tags:
 *              - wanted
 *          parameters:
 *              - in: path
 *                name: userId
 *                required: true
 *                schema:
 *                  type: number
 *                description: User Id the wanted is connected to.
 *                example: 1
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
 *                  adId:
 *                      type: number
 *                      description: The Id of the ad the wanted is connected to.
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
 *          wanted:
 *              type: object
 *              properties:
 *                  adId:
 *                      type: number
 *                      description: Id of the connected ad
 *                  freight:
 *                      type: string
 *                      description: Description of the freight
 */
router.get('/getUserWanted/:id', authenticateToken, async function(req, res, next) {
    try {
        const id = req.params.id;
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

router.post('/createWanted', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        const {description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, freight} = req.body;
        const wanted = await addNewWanted(description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, id, freight);

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


router.get('/:id', async function(req, res, next) {
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
