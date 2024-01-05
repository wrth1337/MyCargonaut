const mariadb = require('mariadb');
const express = require('express');
const authenticateToken = require('./auth');

// eslint-disable-next-line new-cap
const router = express.Router();

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

async function getUserCoins(id) {
    const coinsQuery = 'SELECT coins FROM user WHERE userId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(coinsQuery, [id]);
        await conn.release();

        if (result.length > 0) {
            return { success: true, data: result[0] };
        } else {
            return { success: false };
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
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
router.get('/', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        const userCoins = await getUserCoins(id);

        if (userCoins.success) {
            res.status(200);
            res.json({ status: 1, coins: userCoins.data });
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({ status: 99, error: 'Fetching Coins Data failed' });
    }
});
module.exports = { router, getUserCoins};
