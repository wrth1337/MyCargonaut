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


async function getUserVehicles(email) {
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userVehicles = 'SELECT name FROM vehicle WHERE userId = ?';

    try {
        const conn = await pool.getConnection();
        const resid = await conn.query(uid, [email]);
        const id = resid[0].userId;
        const result = await conn.query(userVehicles, [id]);
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
 *      - name: vehicle
 *        description: Routes that are connected to the vehicles of an user
 * /vehicle:
 *      get:
 *          summary: get user vehicles.
 *          description: get a list of the user vehicles.
 *          tags:
 *              - vehicle
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
 *                  description: user vehicle data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  vehicleData:
 *                                      type: array
 *                                      description: The user vehicle data.
 *                                      items:
 *                                        $ref: '#/components/schemas/vehicle'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * components:
 *      schemas:
 *          vehicle:
 *              type: object
 *              properties:
 *                  name:
 *                      type: string
 *                      description: The name of the vehicle.
 */

router.get('/vehicle', async function(req, res, next) {
    try {
      const email = req.query.email;
      const vehicle = await getUserVehicles(email);
      if (vehicle.success) {
        res.status(200);
        res.json({ status: 1, vehicleData: vehicle.data });
      } else {
        res.status(204).json(null);
        //res.json({ status: 0 });
      }
    } catch (error) {
        res.status(500);
        res.json({ status: 99, error: 'Fetching Vehicle Data failed' });
    }
});


module.exports = { router, getUserVehicles };