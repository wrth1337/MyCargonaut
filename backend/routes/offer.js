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

async function getUserOffers(id) {
    const userOffers = 'SELECT a.startLocation, a.endLocation, a.startDate FROM ad a JOIN offer o ON o.adId = a.adId JOIN booking b ON b.adId = a.adId JOIN status s ON s.bookingId = b.bookingId WHERE s.endRide = FALSE AND a.userId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(userOffers, [id]);
        await conn.release();
        if (result.length > 0) {
            return { success: true, data: result };
        } else {
            return { success: false };
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function addOffer(description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId, vehicleId, pricePerPerson, pricePerFreight) {
    const addOfferAd = 'INSERT INTO ad (description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?,?)';
    const addOffer = 'INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?, LAST_INSERT_ID(), ?, ?)';
    const addBooking = 'INSERT INTO booking (adId, userId, price, numSeats) VALUES (?,?,0.0,0)';
    const addStatus = 'INSERT INTO status (bookingId) VALUES (LAST_INSERT_ID())';

    try {
        const conn = await pool.getConnection();
        const resA = await conn.query(addOfferAd, [description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId]);
        const adId = resA.insertId;
        const resO = await conn.query(addOffer, [vehicleId, adId, pricePerPerson, pricePerFreight]);
        const resB = await conn.query(addBooking, [adId, userId]);
        const resS = await conn.query(addStatus, []);
        await conn.release();
        return 1;
    } catch (error) {
        return 0;
    }
}

router.post('/createOffer', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        const {OfferDescription, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, vehicleId, pricePerPerson, pricePerFreight} = req.body;
        const offer = await addOffer(OfferDescription, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, id, vehicleId, pricePerPerson, pricePerFreight);

        if (offer === 1) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 0});
        }
    }catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Offer Data failed'});
    }
});

// ---Routes--- //
/**
 * @swagger
 * tags:
 *      - name: offer
 *        description: Routes that are connected to the offers of an user
 * /offer:
 *      get:
 *          summary: get user offers.
 *          description: get a list of the user offers.
 *          tags:
 *              - offer
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
 *                  description: user offer data successfully fetched.
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
 *                                        $ref: '#/components/schemas/offer'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * components:
 *      schemas:
 *          offer:
 *              type: object
 *              properties:
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
router.get('/getUserOffer', authenticateToken, async function(req, res, next) {
    try {
      const id = req.user_id;
      const offer = await getUserOffers(id);

      if (offer.success) {
        res.status(200);
        res.json({ status: 1, offerData: offer.data });
      } else {
        res.status(204).json(null);
      }
    } catch (error) {
        res.status(500);
        res.json({ status: 99, error: 'Fetching Offer Data failed' });
    }
});




module.exports = { router, getUserOffers, addOffer };