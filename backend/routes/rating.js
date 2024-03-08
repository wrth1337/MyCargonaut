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
async function getRatingsByUserId(userId) {
    const userVehicles = 'SELECT * FROM rating WHERE userId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(userVehicles, [userId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function saveNewRating(bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) {
    const newRating = `INSERT INTO rating (bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
        const conn = await pool.getConnection();
        // eslint-disable-next-line no-unused-vars
        const result = await conn.query(newRating, [bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment]);
        await conn.release();
        return 0;
    } catch (error) {
        console.error(error);
        return 1;
    }
}

async function isRatingAlreadyDone(bookingId, author, userId) {
    const checkRatingExists = `SELECT COUNT(*) AS count FROM rating WHERE bookingId = ? AND userWhoIsEvaluating = ? AND userWhoWasEvaluated = ?`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(checkRatingExists, [bookingId, author, userId]);
        console.log(result)
        console.log({bookingId, author, userId})
        await conn.release();
        return (result[0].count > 0);
    } catch (error) {
        console.error(error);
        throw error;
    }
}
// ---Routes--- //
/**
 * @swagger
 * tags:
 *      - name: rating
 *        description: Routes that are connected to ratings users.
 * /rating/{userId}:
 *      get:
 *          summary: get user ratings.
 *          description: get a list of the user ratings.
 *          tags:
 *              - rating
 *          parameters:
 *              - in: query
 *                name: userId
 *                required: true
 *                schema:
 *                  type: string
 *                description: The Id of the user.
 *                example: 1
 *          responses:
 *              200:
 *                  description: user vehicle data successfully fetched.
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
 *                                      description: The users rating data.
 *                                      items:
 *                                        $ref: '#/components/schemas/rating'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 *              500:
 *                  description: Gettin rattings failed.
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
 *                                      description: Internal Server Error.
 * /rating:
 *      post:
 *          summary: Post a new rating.
 *          security:
 *              - bearerAuth: []
 *          description: Posts a new rating of the logged in user to another user.
 *          tags:
 *              - rating
 *          requestBody:
 *              description: The data of the new vehicle.
 *              content:
 *                    application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - userWhoWasEvaluated
 *                              - punctuality
 *                              - agreement
 *                              - pleasent
 *                              - freight
 *                          properties:
 *                              userWhoWasEvaluated:
 *                                  type: number
 *                                  description: The userId of the user evaluated.
 *                                  example: 1
 *                              punctuality:
 *                                  type: number
 *                                  description: The number of punctuality rating.
 *                                  example: 4
 *                              agreement:
 *                                  type: number
 *                                  description: The number of agreement rating.
 *                                  example: 5
 *                              pleasent:
 *                                  type: number
 *                                  description: The number of pleasent rating.
 *                                  example: 5
 *                              freight:
 *                                  type: number
 *                                  description: The number of freight rating.
 *                                  example: 5
 *                              comment:
 *                                  type: string
 *                                  description: Optional comment of the rating.
 *                                  example: The driver was very nice.
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
 *                                      description: Rating couldn´t be saved in db.
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
 *              409:
 *                  description: Conflict.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  message:
 *                                      type: string
 *                                      description: Your already rated this ride.
 * /rating/done/{bookingId}/{userId}:
 *      get:
 *          summary: Was a rating done allready.
 *          security:
 *              - bearerAuth: []
 *          description: Is there a rating by the user to this booking allready.
 *          tags:
 *              - rating
 *          parameters:
 *            - in: path
 *              name: booking
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the booking the rating is connected to.
 *            - in: path
 *              name: user
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the user who is being evaluated.
 *          responses:
 *              200:
 *                  description: Get succesfull.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  ratingDone:
 *                                      type: boolean
 *                                      description: If a rating was done allready.
 *              500:
 *                  description: Update failed.
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
 *                                      description: Internal Server error.
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
 * components:
 *      schemas:
 *          rating:
 *              type: object
 *              properties:
 *                  ratingId:
 *                      type: number
 *                      description: The id of the rating.
 *                  booking:
 *                      type: number
 *                      description: The id of the booking the rating is connected to.
 *                  userWhoIsEvaluating:
 *                      type: number
 *                      description: The id of the user who is evaluating.
 *                  userWhoWasEvaluated:
 *                      type: number
 *                      description: The id of the user who was evaluated.
 *                  punctuality:
 *                      type: number
 *                      description: The punctuality rating.
 *                  agreement:
 *                      type: number
 *                      description: The agreement rating.
 *                  pleasant:
 *                      type: number
 *                      description: The pleasent rating.
 *                  freight:
 *                      type: number
 *                      description: The freight rating.
 *                  comment:
 *                      type: string
 *                      description: The optional comment.
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 * security:
 *  - bearerAuth: []
 */
router.post('/', authenticateToken, async function(req, res, next) {
    const bookingId = req.body.bookingId;
    const userId = req.user_id;
    const rating = req.body;
    const {userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment} = rating;

    const conn = await pool.getConnection();
    try {
        const ratingExists = await isRatingAlreadyDone(bookingId, userId);
        if (ratingExists) {
            res.status(409);
            res.send({status: 1, msg: 'Your already rated this ride.'});
        } else if (userId == userWhoWasEvaluated) {
            res.status(409);
            res.send({status: 2, msg: 'You cant rate youreself'});
        } else {
            // eslint-disable-next-line no-unused-vars
            const newRating = await saveNewRating(bookingId, userId, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment);
            res.status(201);
            res.send({status: 0, msg: 'Rating created'});
        }
    } catch (error) {
        res.status(500);
        res.send({status: 500, error: 'Rating couldn´t be saved in db'});
    } finally {
        if (conn) await conn.release();
    }
});

router.get('/:id', async function(req, res, next) {
    const userId = req.params.user_id;

    const conn = await pool.getConnection();
    try {
        const result = await getRatingsByUserId(userId);
        if (result.length > 0) {
            res.status(200);
            res.json({status: 1, data: result});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.send({status: 500, error: 'Rating couldn´t be saved in db'});
    } finally {
        if (conn) await conn.release();
    }
});

router.get('/done/:bookingId/:userId', authenticateToken, async function(req, res, next) {
    const bookingId = req.params.bookingId;
    const userId = req.params.userId;
    const author = req.user_id;

    const conn = await pool.getConnection();
    try {
        const ratingExists = await isRatingAlreadyDone(bookingId, author, userId);
        res.status(200);
        res.send({status: 0, ratingDone: ratingExists});
    } catch (error) {
        res.status(500);
        res.send({status: 500, error: 'Internal Server error'});
    } finally {
        if (conn) await conn.release();
    }
});

module.exports = {router, saveNewRating, isRatingAlreadyDone, getRatingsByUserId};
