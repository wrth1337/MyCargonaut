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
async function getSeatsAvailable(adId) {
    const select = `SELECT SUM(numSeats) AS usedSeats FROM booking WHERE adId = ? AND state = 'confirmed' AND canceled = FALSE`;
    const totalSeatsQuery = `SELECT numSeats FROM ad WHERE adId = ?`;
    try {
        const conn = await pool.getConnection();
        const usedSeats = (await conn.query(select, [adId]))[0].usedSeats;
        const totalSeats = (await conn.query(totalSeatsQuery, [adId]))[0].numSeats;
        await conn.release();
        return (totalSeats - usedSeats);
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function newBooking(adId, userId, price, numSeats) {
    const insert = `INSERT INTO booking (adId, userId, price, numSeats) VALUES (?,?,?,?);`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(insert, [adId, userId, price, numSeats]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function cancelBooking(bookingId, userId) {
    const update = `UPDATE booking SET canceled = true WHERE bookingId = ? AND userId = ? AND state != 'confirmed'`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(update, [bookingId, userId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function confirmBooking(bookingId, state) {
    const update = `UPDATE booking SET state = ? WHERE bookingId = ?`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(update, [state, bookingId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function getBookings(userId) {
    const select = 'SELECT * FROM booking WHERE userId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(select, [userId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function getBookingsByAd(adId) {
    const select = 'SELECT * FROM booking WHERE adId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(select, [adId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function payment(price, userId, bookingId) {
    console.log('payment here');
    // price von user Guthaben abziehen -> Wenn Fehler error oder so
    // Da beide Operationen atomar zusammenausgeführt werden müssen vllt in einer Query mit ; getrennt 
    const update = `BEGIN;
                    UPDATE status SET paymentReceived = true WHERE bookingId = ?;
                    COMMIT;`;
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(update, [bookingId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
};

async function getPriceOfBooking(adId, numSeats, freight) {
    const isWanted = `SELECT * FROM wanted WHERE adId = ?`;
    const getPrice = `SELECT pricePerPerson, pricePerFreight FROM offer WHERE adId = ?`;
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(isWanted, [adId]);
        if (result.length > 0) return 0;
        const priceRes = await conn.query(getPrice, [adId]);
        await conn.release();
        const price = (priceRes[0].pricePerPerson * numSeats + priceRes[0].pricePerFreight * freight);
        return price;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}
// ---Routes--- //
/**
 * @swagger
 * tags:
 *      - name: booking
 *        description: Routes that are connected to the bookings of an user
 * /booking:
 *      get:
 *          summary: get a users bookings.
 *          security:
 *              - bearerAuth: []
 *          description: get a list of the users booking.
 *          tags:
 *              - booking
 *          responses:
 *              200:
 *                  description: user booking data successfully fetched.
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
 *                                      description: The user booking data.
 *                                      items:
 *                                        $ref: '#/components/schemas/booking'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 *              401:
 *                  description: Unauthorized.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/unauthorizedReturn'
 *      post:
 *          summary: post a new booking.
 *          security:
 *              - bearerAuth: []
 *          description: Posts a new booking by the logged in user to an specified ad.
 *          tags:
 *              - booking
 *          requestBody:
 *              description: The data of the booking.
 *              content:
 *                    application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - adId
 *                              - userId
 *                              - price
 *                              - numSeats
 *                          properties:
 *                              adId:
 *                                  type: string
 *                                  description: The Id of the Ad the booking is connected to.
 *                                  example: 2
 *                              userId:
 *                                  type: number
 *                                  description: The Id of the user who maked the booking.
 *                                  example: 1
 *                              numSeats:
 *                                  type: number
 *                                  description: The number of seats the booking takes.
 *                                  example: 1
 *          responses:
 *              200:
 *                  description: Insert succesfull.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *              500:
 *                  description: Insert failed.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  error:
 *                                      type: string
 *                                      description: The error message.
 *              401:
 *                  description: Unauthorized.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  message:
 *                                      type: string
 *                                      description: Unauthorized.
 * /booking/cancel/{bookingId}:
 *      post:
 *          summary: Cancel booking.
 *          security:
 *              - bearerAuth: []
 *          description: Cancel a booking specified by its Id.
 *          tags:
 *              - booking
 *          parameters:
 *            - in: path
 *              name: bookingId
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the booking to cancel.
 *          responses:
 *              200:
 *                  description: Booking successfully canceled.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
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
 * /booking/ad/{adId}:
 *      get:
 *          summary: Get bookings connected to an ad.
 *          security:
 *              - bearerAuth: []
 *          description: Get all bookings that are connected to the specified ad.
 *          tags:
 *              - booking
 *          parameters:
 *            - in: path
 *              name: adId
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the ad the bookings are connected to.
 *          responses:
 *              200:
 *                  description: Booking successfully canceled.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
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
 * /booking/confirm/{bookingId}:
 *      post:
 *          summary: Confirm booking.
 *          security:
 *              - bearerAuth: []
 *          description: Confirm a booking specified by its Id.
 *          tags:
 *              - booking
 *          parameters:
 *            - in: path
 *              name: bookingId
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the booking is connected to to confirm.
 *          responses:
 *              200:
 *                  description: user booking successfully confirmed.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
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
* /booking/denie/{bookingId}:
 *      post:
 *          summary: Denie booking.
 *          security:
 *              - bearerAuth: []
 *          description: Denie a booking specified by its Id.
 *          tags:
 *              - booking
 *          parameters:
 *            - in: path
 *              name: bookingId
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the booking is connected to to denie.
 *          responses:
 *              200:
 *                  description: user booking successfully denied.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
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
 *          booking:
 *              type: object
 *              properties:
 *                  bookingId:
 *                      type: integer
 *                      description: The Id of the booking.
 *                  adId:
 *                      type: integer
 *                      description: The Id of the ad the booking is connected to.
 *                  userId:
 *                      type: integer
 *                      description: The Id of the user that did the booking.
 *                  price:
 *                      type: integer
 *                      description: The price of the booking.
 *                  timeBooking:
 *                      type: string
 *                      description: The timestamp the booking was created.
 *                  numSeats:
 *                      type: integer
 *                      description: The number of the seats the booking has.
 *                  canceled:
 *                      type: boolean
 *                      description: If the booking was canceled.
 *                  state:
 *                      type: string
 *                      enum: [pending, confirmed, denied]
 *                      description: Status of the booking.
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
 * security:
 *  - bearerAuth: []
 */

router.get('/', authenticateToken, async function(req, res, next) {
    try {
        const userId = req.user_id;
        const result = await getBookings(userId);
        if (result) {
            res.status(200);
            res.json({status: 1, data: result});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Getting Booking Data failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Getting Booking Data failed'});
    }
});

router.post('/', authenticateToken, async function(req, res, next) {
    try {
        const userId = req.user_id;
        const {adId, numSeats, freight} = req.body;
        const availableSeats = await getSeatsAvailable(adId);
        if (availableSeats < numSeats) {
            res.status(400);
            res.json({status: 2, error: 'Not enough Seats available'});
            return;
        }
        const price = await getPriceOfBooking(adId, numSeats, freight);
        const result = await newBooking(adId, userId, price, numSeats);
        const paymentResult = await payment(price, userId, result.insertId);
        if (result.affectedRows > 0) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Storing Booking Data failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Storing Booking Data failed'});
    }
});

router.post('/cancel/:id', authenticateToken, async function(req, res, next) {
    try {
        const userId = req.user_id;
        const bookingId = req.params.id;
        const result = await cancelBooking(bookingId, userId);
        if (result.affectedRows > 0) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Canceling booking failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Canceling booking failed'});
    }
});

router.post('/confirm/:id', authenticateToken, async function(req, res, next) {
    try {
        const bookingId = req.params.id;
        const result = await confirmBooking(bookingId, 'confirmed');
        if (result.affectedRows > 0) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Confirming booking failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Confirming booking failed'});
    }
});

router.post('/denie/:id', authenticateToken, async function(req, res, next) {
    try {
        const bookingId = req.params.id;
        const result = await confirmBooking(bookingId, 'denied');
        if (result.affectedRows > 0) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Confirming booking failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Confirming booking failed'});
    }
});

router.get('/ad/:id', authenticateToken, async function(req, res, next) {
    try {
        const adId = req.params.id;
        const result = await getBookingsByAd(adId);
        if (result) {
            res.status(200);
            res.json({status: 1, data: result});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Getting Booking Data failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Getting Booking Data failed'});
    }
});


module.exports = {router, getBookings, newBooking, cancelBooking, getBookingsByAd, getSeatsAvailable, confirmBooking};
