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

async function getUserOffers(id) {
    const userOffers = `
    SELECT a.adId, a.startLocation, a.endLocation, a.startDate
    FROM ad a 
        JOIN offer o ON o.adId = a.adId
    WHERE a.state = 'created'
      AND a.userId = ?`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(userOffers, [id]);
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

// eslint-disable-next-line
async function addOffer(description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId, vehicleId, pricePerPerson, pricePerFreight) {
    const addOfferAd = `
        INSERT INTO ad (description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId)
        VALUES (?,?,?,?,?,?,?,?,?,?)`;
    const addOffer = 'INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?, ?, ?, ?)';

    try {
        const conn = await pool.getConnection();
        await conn.query(addOfferAd, [description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId]);
        await conn.query(addOffer, [vehicleId, pricePerPerson, pricePerFreight]);
        await conn.release();
        return 1;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

async function getOfferById(id) {
    const query = 'SELECT * FROM offer WHERE adId = ?';
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
 *      - name: offer
 *        description: Routes that are connected to the offers of an user
 *
 * offer/:id:
 *      get:
 *          summary: get one offer.
 *          description: gets the offer with the specified adId.
 *          tags:
 *              - offer
 *          parameters:
 *              - in: query
 *                name: id
 *                required: true
 *                schema:
 *                  type: number
 *                description: AdId the wanted data is connected to.
 *                example: 2
 *          responses:
 *              200:
 *                  description: offer data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  data:
 *                                      $ref: '#/components/schemas/offer'
 *                                      description: The requested offer.
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * /offer/getUserOffer/{userId}:
 *      get:
 *          summary: get user offers by user Id.
 *          description: get a list of the user offer ads.
 *          tags:
 *              - offer
 *          parameters:
 *              - in: path
 *                name: userId
 *                required: true
 *                schema:
 *                  type: number
 *                description: User Id the offer is connected to.
 *                example: 1
 *          responses:
 *              200:
 *                  description: user offer ad data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  offerData:
 *                                      type: array
 *                                      description: The user offer data.
 *                                      items:
 *                                        $ref: '#/components/schemas/offer_ad'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * components:
 *      schemas:
 *          offer:
 *              type: object
 *              properties:
 *                  vehicleId:
 *                      type: number
 *                      description: Id of the connected vehicle
 *                  adId:
 *                      type: number
 *                      description: Id of the connected ad
 *                  pricePerPerson:
 *                      type: number
 *                      description: Price per person of this offer
 *                  pricePerFreight:
 *                      type: number
 *                      description: Price per freight of this offer
 *          offer_ad:
 *              type: object
 *              properties:
 *                  adId:
 *                      type: number
 *                      description: The Id of the ad the offer is connected to.
 *                  startLocation:
 *                      type: string
 *                      description: The start location of the offer.
 *                  endLocation:
 *                      type: string
 *                      description: The end location of the offer.
 *                  startDate:
 *                      type: string
 *                      format: date
 *                      description: The start date of the offer.
 */

router.get('/getUserOffer/:id', async function(req, res, next) {
    try {
        const id = req.params.id;
        const offer = await getUserOffers(id);

        if (offer.success) {
            res.status(200);
            res.json({status: 1, offerData: offer.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Offer Data failed'});
    }
});

router.post('/createOffer', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        // eslint-disable-next-line
        const {OfferDescription, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, vehicleId, pricePerPerson, pricePerFreight} = req.body;
        // eslint-disable-next-line
        const offer = await addOffer(OfferDescription, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, id, vehicleId, pricePerPerson, pricePerFreight);

        if (offer === 1) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 0});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Offer Data failed'});
    }
});

router.get('/:id', async function(req, res, next) {
    try {
        const offer = await getOfferById(req.params.id);

        if (offer.success) {
            res.status(200);
            res.json({status: 1, data: offer.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching offer Data failed'});
    }
});

module.exports = {router, getUserOffers, getOfferById, addOffer};
