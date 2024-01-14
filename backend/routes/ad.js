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

// ---Methods--- //

async function getLastAds() {
    const lastAds = 'SELECT * FROM ad ORDER BY adId DESC LIMIT 6';
    const intermediateGoalsQuery = 'SELECT * FROM intermediateGoal WHERE adId = ?';
    const isOfferQuery = 'SELECT 1 FROM offer WHERE adId = ?';
    const isWantedQuery = 'SELECT 1 FROM wanted WHERE adId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(lastAds);
        result.forEach(async (element) => {
            const intermediateGoals = await conn.query(intermediateGoalsQuery, element.adId);
            element.intermediateGoals = intermediateGoals;
        });
        result.forEach(async (element) => {
            element.type = '';
            const isOffer = await conn.query(isOfferQuery, element.adId);
            if (isOffer.length > 0) {
                element.type = 'offer';
            }
        });
        result.forEach(async (element) => {
            const isWanted = await conn.query(isWantedQuery, element.adId);
            if (isWanted.length > 0) {
                element.type = 'wanted';
            }
        });
        await conn.release();

        if (result.length > 0) {
            return {success: true, data: {result}};
        } else {
            return {success: false};
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function getAdById(id) {
    const query = 'SELECT * FROM ad WHERE adId = ?';
    const intermediateGoalsQuery = 'SELECT * FROM intermediateGoal WHERE adId = ?';
    const isOfferQuery = 'SELECT 1 FROM offer WHERE adId = ?';
    const isWantedQuery = 'SELECT 1 FROM wanted WHERE adId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(query, id);
        result.forEach(async (element) => {
            const intermediateGoals = await conn.query(intermediateGoalsQuery, element.adId);
            element.intermediateGoals = intermediateGoals;
        });
        result.forEach(async (element) => {
            element.type = '';
            const isOffer = await conn.query(isOfferQuery, element.adId);
            if (isOffer.length > 0) {
                element.type = 'offer';
            }
        });
        result.forEach(async (element) => {
            const isWanted = await conn.query(isWantedQuery, element.adId);
            if (isWanted.length > 0) {
                element.type = 'wanted';
            }
        });
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
        console.error('Fehler bei der Abfrage:', error);
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
 *                   * /byId:
 *   get:
 *      summary: Retrieve an advertisement by its ID to use on Add-Card
 *      description: Get a specific advertisement's details by providing its ID.
 *      parameters:
 *       - in: query
 *          name: adId
 *          required: true
 *         description: Numeric ID of the advertisement to retrieve.
 *          schema:
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
 *          * /type:
 *    get:
 *      summary: Retrieve the type of an advertisement by its ID
 *      description: Get the type of a specific advertisement by providing its ID.
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
 *                  type:
 *                      type: string
 *                      description: The type of the ad ('offer' / 'wanted').
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

router.get('/byId', async function(req, res, next) {
    try {
        console.log(req.query.adId);
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

module.exports = {router, getLastAds, getAdCardById, getTypeById};
