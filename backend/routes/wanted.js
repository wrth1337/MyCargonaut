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

async function getUserWanteds(email) {
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userWanted = 'SELECT a.startLocation, a.endLocation, a.startDate FROM ad a JOIN wanted w ON w.adId = a.adId JOIN booking b ON b.adId = a.adId JOIN status s ON s.bookingId = b.bookingId WHERE s.endRide = FALSE AND a.userId = ?';

    try {
        const conn = await pool.getConnection();
        const resid = await conn.query(uid, [email]);
        const id = resid[0].userId;
        const result = await conn.query(userWanted, [id]);
        await conn.release();
        console.log('User Wanteds fetched');
        if (result.length > 0) {
            console.log(result);
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
 *      - name: wanted
 *        description: Routes that are connected to the wanteds of an user
 * /wanted:
 *      get:
 *          summary: get user wanteds.
 *          description: get a list of the user wanteds.
 *          tags:
 *              - wanted
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
 *                  description: user wanted data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  wantedData:
 *                                      type: array
 *                                      description: The user wanted data.
 *                                      items:
 *                                        $ref: '#/components/schemas/wanted'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * components:
 *      schemas:
 *          wanted:
 *              type: object
 *              properties:
 *                  startLocation:
 *                      type: string
 *                      description: The start location of the wanted.
 *                  endLocation:
 *                      type: string
 *                      description: The end location of the wanted.
 *                  startDate:
 *                      type: string
 *                      format: date
 *                      description: The start date of the wanted.
 */
router.get('/wanted', async function(req, res, next) {
    try {
      const email = req.query.email;
      const wanted = await getUserWanteds(email);
  
      if (wanted.success) {
        console.log(wanted.data);
        res.status(200);
        res.json({ status: 1, wantedData: wanted.data });
      } else {
        res.status(204).json(null);
        //res.json({ status: 0 });
      }
    } catch (error) {
        res.status(500);
        res.json({ status: 99, error: 'Fetching Wanted Data failed' });
    }
});
  


module.exports = { router, getUserWanteds };