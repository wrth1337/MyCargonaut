const mariadb = require('mariadb');
const express = require('express');
const authenticateToken = require('./auth');
const rateLimit = require('express-rate-limit');

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
async function subtractUserCoins(id, coinsToSubtract) {
    const userExistsQuery = 'SELECT 1 FROM user WHERE userId = ?';
    const coinsQuery = 'SELECT coins FROM user WHERE userId = ?';
    const subtractCoinsQuery = 'UPDATE user SET coins = coins - ? WHERE userId = ?';

    try {
        const conn = await pool.getConnection();

        const userExists = await conn.query(userExistsQuery, [id]);
        if (userExists.length === 0) {
            await conn.release();
            return {success: false, message: 'User does not exist'};
        }
        const currentCoins = await conn.query(coinsQuery, [id]);
        if (currentCoins[0].coins < coinsToSubtract) {
            await conn.release();
            return {success: false, message: 'Not enough coins'};
        }
        const result = await conn.query(subtractCoinsQuery, [coinsToSubtract, id]);
        await conn.release();

        if (result.affectedRows > 0) {
            return {success: true};
        } else {
            return {success: false};
        }
    } catch (error) {
        throw error;
    }
}
async function addUserCoins(id, coinsToAdd) {
    const addCoinsQuery = 'UPDATE user SET coins = coins + ? WHERE userId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(addCoinsQuery, [coinsToAdd, id]);
        await conn.release();

        if (result.affectedRows > 0) {
            return {success: true};
        } else {
            return {success: false};
        }
    } catch (error) {
        console.error('Fehler bei addUserCoins: ', error);
        throw error;
    }
}

async function getUserCoins(id) {
    const coinsQuery = 'SELECT coins FROM user WHERE userId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(coinsQuery, [id]);
        await conn.release();

        if (result.length > 0) {
            return {success: true, data: result[0].coins};
        } else {
            return {success: false};
        }
    } catch (error) {
        throw error;
    }
}

/**
 * @swagger
 * tags:
 *      - name: coins
 *        description: Routes that are connected to the coins of a user
 * /coins:
 *      get:
 *          summary: get user coins data.
 *          description: get user coins data.
 *          tags:
 *              - coins
 *          parameters:
 *              - in: header
 *                name: Authorization
 *                required: true
 *                schema:
 *                  type: string
 *                description: The token of the current user.
 *          responses:
 *              200:
 *                  description: user coins data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  coins:
 *                                      type: object
 *                                      description: The coins data of the user.
 *                                      properties:
 *                                          coins:
 *                                               type: integer
 *                                               description: The number of coins of the user.
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 *              500:
 *                  description: server error.
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
 */
router.get('/', authenticateToken, async function(req, res) {
    try {
        const id = req.user_id;
        const userCoins = await getUserCoins(id);

        if (userCoins.success) {
            res.status(200);
            res.json({coins: userCoins.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Coins Data failed'});
    }
});

/**
 * @swagger
 * tags:
 *      - name: coins
 *        description: Routes that are connected to the coins of a user
 * /coins/add:
 *      post:
 *          summary: add coins to user.
 *          description: add coins to user.
 *          tags:
 *              - coins
 *          parameters:
 *              - in: header
 *                name: Authorization
 *                required: true
 *                schema:
 *                  type: string
 *                description: The token of the current user.
 *              - in: body
 *                name: coins
 *                required: true
 *                schema:
 *                  type: integer
 *                description: The number of coins to add.
 *          responses:
 *              200:
 *                  description: coins successfully added.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  message:
 *                                      type: string
 *                                      description: The success message.
 *              500:
 *                  description: server error.
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
 */
router.post('/add', authenticateToken, async function(req, res) {
    try {
        const id = req.user_id;
        const fee = 0.1;
        const coinsToAdd = (1-fee) * req.body.coins;

        if (coinsToAdd <= 0) {
            res.status(400);
            res.send({status: 99, error: 'Invalid amount. Must be greater than 0'});
        }

        const result = await addUserCoins(id, coinsToAdd);
        if (result.success) {
            res.status(200);
            res.json({status: 1, message: 'Coins successfully added'});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Adding coins failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Adding coins failed'});
    }
});
module.exports = {router, getUserCoins, addUserCoins, subtractUserCoins};
