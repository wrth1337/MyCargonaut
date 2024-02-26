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
async function addMessage(userId, adId, message) {
    const addMessage = 'INSERT INTO message (userId, adId, messageText) VALUES (?,?,?)';

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(addMessage, [userId, adId, message]);
        return 0;
    } catch (error) {
        return 1;
    } finally {
        if (conn) conn.release();
    }
}

async function getLastMessages(adId) {
    const getMessages = 'SELECT * FROM message WHERE adId = ? ORDER BY messageId DESC';
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(getMessages, [adId]);
        conn.release();
        return result.reverse();
    } catch (error) {
        return error;
    }
}


// ---Routes--- //
/**
 * @swagger
 * tags:
 *      - name: message
 *        description: Routes that are connected to messages.
 * /add:
 *      post:
 *          summary: Add a new message to the database.
 *          description: Add a new message to the database.
 *          tags:
 *              - message
 *          parameters:
 *              - in: query
 *                name: JWT
 *                required: true
 *                schema:
 *                  type: token
 *                description: JWT from the logged-in user.
 *              - in: query
 *                name: userId
 *                required: true
 *                schema:
 *                  type: integer
 *                description: ID of the user that wrote the message.
 *              - in: query
 *                name: adId
 *                required: true
 *                schema:
 *                  type: integer
 *                description: ID of the ad the message got wrote in.
 *              - in: query
 *                name: message
 *                required: true
 *                schema:
 *                  type: string
 *                description: The content of the message.
 *          responses:
 *              200:
 *                  description: Message added.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              - $ref: '#/components/schemas/normal-message'
 *
 * components:
 *      schemas:
 *          normal-message:
 *              type: object
 *              properties:
 *                  status:
 *                      type: integer
 *                      description: The status-code.
 *                  msg:
 *                      type: string
 *                      description: A brief description of the message.
 *          error-message:
 *              type: object
 *              properties:
 *                  status:
 *                      type: integer
 *                      description: The status-code.
 *                  error:
 *                      type: string
 *                      description: Errormessage
 */
router.post('/add', authenticateToken, async function(req, res, next) {
    const conn = await pool.getConnection();
    try {
        const userId = req.body.userId;
        const adId = req.body.adId;
        const message = req.body.message;

        const result = await addMessage(userId, adId, message);

        if (result === 0) {
            res.status(200);
            res.send({status: 0, msg: 'Message saved'});
        } else {
            res.status(500);
            res.send({status: 0, error: 'error'});
        }
    } catch (error) {
        res.status(500);
        res.send({status: 0, error: 'error'});
    } finally {
        if (conn) await conn.release();
    }
});

/**
 * @swagger
 * /getLast:
 *      get:
 *          summary: Get the last messages from an ad out of the database.
 *          description: Get the last messages from an ad out of the database.
 *          tags:
 *              - chat
 *          parameters:
 *              - in: query
 *                name: JWT
 *                required: true
 *                schema:
 *                  type: token
 *                description: JWT from the logged-in user.
 *              - in: query
 *                name: toUserId
 *                required: true
 *                schema:
 *                  type: integer
 *                description: ID of the ad the message got wrote in.
 *          responses:
 *              200:
 *                  description: Last messages.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              - $ref: '#/components/schemas/normal-message'
 *                              - $ref: '#/components/schemas/error-message'
 *              204:
 *                  description: No Content.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              - $ref: '#/components/schema/error-message'
 *
 * components:
 *      schemas:
 *          normal-message:
 *              type: object
 *              properties:
 *                  status:
 *                      type: integer
 *                      description: The status-code.
 *                  msg:
 *                      type: string
 *                      description: A brief description of the message.
 *                  data:
 *                      type: array
 *                      description: Last Messages
 *          error-message:
 *              type: object
 *              properties:
 *                  status:
 *                      type: integer
 *                      description: The status-code.
 *                  error:
 *                      type: string
 *                      description: Errormessage
 */
router.get('/getLast/:adId', async function(req, res, next) {
    const conn = await pool.getConnection();
    try {
        const adId = req.params.adId;

        const sqlResult = await getLastMessages(adId);

        if (sqlResult.length < 1) {
            res.status(204);
            res.send({status: 1, error: 'No content for the given adId'});
        } else {
            const result = JSON.parse(JSON.stringify(sqlResult, (key, value) =>
                typeof value === 'bigint' ?
                    value.toString() :
                    value,
            ));
            res.status(200);
            res.send({status: 0, msg: 'Last messages', data: result});
        }
    } catch (error) {
        res.status(500);
        res.send({status: 0, error: 'error'});
    } finally {
        if (conn) await conn.release();
    }
});


module.exports = {router, addMessage, getLastMessages};
