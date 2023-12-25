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

async function getUserOffers(email) {
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userOffers = 'SELECT a.startLocation, a.endLocation, a.startDate FROM ad a JOIN offer o ON o.adId = a.adId JOIN booking b ON b.adId = a.adId JOIN status s ON s.bookingId = b.bookingId WHERE s.endRide = FALSE AND a.userId = ?';

    try {
        const conn = await pool.getConnection();
        const resid = await conn.query(uid, [email]);
        const id = resid[0].userId;
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
router.get('/offer', async function(req, res, next) {
    try {
      const email = req.query.email;
      const offer = await getUserOffers(email);
  
      if (offer.success) {
        res.status(200);
        res.json({ status: 1, offerData: offer.data });
      } else {
        res.status(204).json(null);
        //res.json({ status: 0 });
      }
    } catch (error) {
        res.status(500);
        res.json({ status: 99, error: 'Fetching Offer Data failed' });
    }
});
  


module.exports = { router, getUserOffers };