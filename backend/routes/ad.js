const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { getSeatsAvailable } = require('./booking');
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

async function getLastAds() {
    const lastAds = 'SELECT * FROM ad ORDER BY adId DESC LIMIT 6';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(lastAds);
        await conn.release();

        if (result.length > 0) {
            return {success: true, data: {result}};
        } else {
            return {success: false};
        }
    } catch (error) {
        throw error;
    }
}

async function getAdById(id) {
    const query = 'SELECT * FROM ad WHERE adId = ?';

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
        throw error;
    }
}

async function getAdCardById(adId) {
    const ad = 'SELECT * FROM ad WHERE ad.adId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(ad, [adId]);
        await conn.release();

        if (result.length > 0) {
            return {success: true, data: result};
        } else {
            return {success: false};
        }
    } catch (error) {
        throw error;
    }
}

async function getTypeById(adId) {
    const offer = 'SELECT o.offerId FROM ad JOIN offer o ON ad.adId = o.adId WHERE ad.adId = ?';
    let res;
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(offer, [adId]);
        await conn.release();
        if (result.length > 0) {
            res = 'offer';
            return {success: true, data: res};
        } else {
            res = 'wanted';
            return {success: true, data: res};
        }
    } catch (error) {
        throw error;
    }
}

async function getIntermediateById(adId) {
    const goals = 'SELECT * FROM intermediateGoal WHERE adId = ?';
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(goals, [adId]);
        await conn.release();
        if (result.length > 0) {
            return {success: true, data: result};
        } else {
            return {success: false};
        }
    } catch (error) {
        throw error;
    }
}

async function startAdById(adId, userId) {
    const update = `UPDATE ad SET state = 'started' WHERE adId = ? AND userId = ?`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(update, [adId, userId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function stopAdById(adId, userId) {
    const update = `UPDATE ad SET state = 'finished' WHERE adId = ? AND userId = ?`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(update, [adId, userId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

// ---Routes--- //
/**
 * @swagger
 * tags:
 *      - name: get last ads
 *        description: Routes that are connected to ads
 * /last:
 *      get:
 *          summary: get last ads.
 *          description: get the latest added ads.
 *          tags:
 *              - ad
 *
 *          responses:
 *              200:
 *                  description: last ad data successfully fetched.
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
 *                                      description: Array of last 6 offers.
 *                                      items:
 *                                        $ref: '#/components/schemas/ad'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * /:id:
 *      get:
 *          summary: get one ad.
 *          description: gets the ad with the specified id.
 *          tags:
 *              - ad
 *
 *          responses:
 *              200:
 *                  description: ad data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  data:
 *                                      type: #/components/schemas/ad
 *                                      description: The requested ad.
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * /byId:
 *   get:
 *      summary: Retrieve an advertisement by its ID to use on Add-Card
 *      description: Get a specific advertisement's details by providing its ID.
 *      tags:
 *          - ad
 *      parameters:
 *       - in: query
 *         name: adId
 *         required: true
 *         description: Numeric ID of the advertisement to retrieve.
 *         schema:
 *            type: integer
 *      responses:
 *        200:
 *          description: Advertisement data retrieved successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 1
 *                  data:
 *                    type: object
 *                    $ref: '#/components/schemas/Ad'
 *        204:
 *          description: No content, advertisement not found.
 *        500:
 *          description: Server error.
 * /type:
 *    get:
 *      summary: Retrieve the type of an advertisement by its ID
 *      description: Get the type of a specific advertisement by providing its ID.
 *      tags:
 *          - ad
 *      parameters:
 *        - in: query
 *          name: adId
 *          required: true
 *          description: Numeric ID of the advertisement to retrieve its type.
 *          schema:
 *            type: integer
 *      responses:
 *        200:
 *          description: Type of the advertisement retrieved successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 1
 *                  data:
 *                    type: object
 *                    properties:
 *                      type:
 *                        type: string
 *                        example: offer
 *        204:
 *          description: No content, type not found for the given advertisement ID.
 *        500:
 *          description: Server error or unable to fetch the type.
 *
 *
 * /:id/type:
 *    get:
 *      summary: Retrieve the type of an ad by its Id
 *      description: Get the type of a specific ad by providing its Id.
 *      tags:
 *          - ad
 *      parameters:
 *        - in: uri
 *          name: adId
 *          required: true
 *          description: Numeric Id of the ad  to retrieve its type.
 *          schema:
 *            type: integer
 *      responses:
 *        200:
 *          description: Type of the ad retrieved successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 1
 *                  data:
 *                    type: object
 *                    properties:
 *                      type:
 *                        type: string
 *                        example: offer
 *        204:
 *          description: No content, type not found for the given advertisement ID.
 *        500:
 *          description: Server error or unable to fetch the type.
 * /:id/sears:
 *    get:
 *      summary: Retrieve the number of seats of an ad by its Id
 *      description: Get the number of seats of a specific ad left available by providing its Id.
 *      tags:
 *          - ad
 *      parameters:
 *        - in: uri
 *          name: adId
 *          required: true
 *          description: Numeric Id of the ad  to retrieve its number of seats left available.
 *          schema:
 *            type: integer
 *      responses:
 *        200:
 *          description: Type of the ad retrieved successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 1
 *                  data:
 *                    type: object
 *                    properties:
 *                      seats:
 *                        type: number
 *                        example: 2
 *        500:
 *          description: Server error or unable to fetch the number of seats.
 * /ad/start/{adId}:
 *      post:
 *          summary: Start Trip.
 *          security:
 *              - bearerAuth: []
 *          description: Start a trip specified by its adId.
 *          tags:
 *              - ad
 *          parameters:
 *            - in: path
 *              name: adId
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the ad of the trip.
 *          responses:
 *              200:
 *                  description: Startet Trip successfully.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  newState:
 *                                      type: string
 *                                      description: The new state (started)
 *              401:
 *                  description: Unauthorized.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/unauthorizedReturn'
 *              500:
 *                  description: Error.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/errorReturn'
 * /ad/stop/{adId}:
 *      post:
 *          summary: Start Trip.
 *          security:
 *              - bearerAuth: []
 *          description: Start a trip specified by its adId.
 *          tags:
 *              - ad
 *          parameters:
 *            - in: path
 *              name: adId
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the ad of the trip.
 *          responses:
 *              200:
 *                  description: Startet Trip successfully.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  newState:
 *                                      type: string
 *                                      description: The new state (finished)
 *              401:
 *                  description: Unauthorized.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/unauthorizedReturn'
 *              500:
 *                  description: Error.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/errorReturn'
 * components:
 *      schemas:
 *          intermediateGoal:
 *              type: object
 *              properties:
 *                  location:
 *                      type: string
 *                      description: Name of the location of the intermediate goal
 *                  adId:
 *                      type: integer
 *                      description: Id of the ad the intermediate Goal is a part of
 *          ad:
 *              type: object
 *              properties:
 *                  adId:
 *                      type: integer
 *                      description: The ads unique Id
 *                  description:
 *                      type: string
 *                      description: Custom description of the ad
 *                  startLocation:
 *                      type: string
 *                      description: The start location of the ad.
 *                  endLocation:
 *                      type: string
 *                      description: The end location of the ad.
 *                  intermediatGoals:
 *                      type: array
 *                      description: Array of intermediate Goals attached to the ad
 *                      items:
 *                          $ref: '#/components/schemas/intermediateGoals'
 *                  startDate:
 *                      type: string
 *                      format: date
 *                      description: The start date of the ad.
 *                  endDate:
 *                      type: string
 *                      format: date
 *                      description: The end date of the ad.
 *                  animals:
 *                      type: boolean
 *                      description: If animals are allowed.
 *                  smoker:
 *                      type: boolean
 *                      description: If smoker are allowed.
 *                  notes:
 *                      type: string
 *                      description: Notes.
 *                  numSeats:
 *                      type: integer
 *                      description: Number of seats available / wanted.
 *                  active:
 *                      type: boolean
 *                      description: If the ad is still active.
 *                  userId:
 *                      type: integer
 *                      description: Id of the author.
 *                  state:
 *                      type: string
 *                      enum: [created, started, finished]
 *                      description: Status of the ad.
 *          errorReturn:
 *              type: object
 *              properties:
 *                  status:
 *                      type: integer
 *                      description: The status-code.
 *                  error:
 *                      type: string
 *                      description: The error message.
 *          unauthorizedReturn:
 *              type: object
 *              properties:
 *                  message:
 *                      type: string
 *                      description: Unauthorized.
 *
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 */
router.get('/last', async function(req, res, next) {
    try {
        const ad = await getLastAds();

        if (ad.success) {
            res.status(200);
            res.json({status: 1, data: ad.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Last Ad Data failed'});
    }
});

router.get('/:id', async function(req, res, next) {
    try {
        const ad = await getAdById(req.params.id);

        if (ad.success) {
            res.status(200);
            res.json({status: 1, data: ad.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Ad Data failed'});
    }
});

router.get('/:id/intermediate', async function(req, res, next) {
    try {
        const ad = await getIntermediateById(req.params.id);
        if (ad.success) {
            res.status(200);
            res.json({status: 1, data: ad.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching intermediate Data failed'});
    }
});

router.get('/byId', async function(req, res, next) {
    try {
        const ad = await getAdCardById(req.query.adId);

        if (ad.success) {
            res.status(200);
            res.json({status: 1, data: ad.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Ad Data failed'});
    }
});

router.get('/type', async function(req, res, next) {
    try {
        const type = await getTypeById(req.query.adId);
        if (type.success) {
            res.status(200);
            res.json({status: 1, data: type.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Type not found'});
    }
});

router.get('/:id/type', async function(req, res, next) {
    try {
        const type = await getTypeById(req.params.id);
        if (type.success) {
            res.status(200);
            res.json({status: 1, data: type.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Type not found'});
    }
});

router.get('/:id/seats', async function(req, res, next) {
    try {
        const seats = await getSeatsAvailable(req.params.id);
        res.status(200);
        res.json({status: 1, seats: seats});
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Type not found'});
    }
});

router.post('/start/:id', authenticateToken, async function(req, res, next) {
    try {
        const result = await startAdById(req.params.id, req.user_id);
        if (result.affectedRows > 0) {
            res.status(200);
            res.json({status: 1, newState: 'started'});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Could not start trip'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Could not start trip'});
    }
});

router.post('/stop/:id', authenticateToken, async function(req, res, next) {
    try {
        const result = await stopAdById(req.params.id, req.user_id);
        if (result.affectedRows > 0) {
            res.status(200);
            res.json({status: 1, newState: 'finished'});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Could not end Trip'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Could not end Trip'});
    }
});

module.exports = {router, getLastAds, getAdById, getAdCardById, getTypeById};
