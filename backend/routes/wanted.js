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

async function getUserWanteds(id) {
    const userWanted = 'SELECT a.startLocation, a.endLocation, a.startDate FROM ad a JOIN wanted w ON w.adId = a.adId JOIN booking b ON b.adId = a.adId JOIN status s ON s.bookingId = b.bookingId WHERE s.endRide = FALSE AND a.userId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(userWanted, [id]);
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

async function addNewWanted(description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId, freight) {
    const addWantedAd = 'INSERT INTO ad (description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?,?)';
    const addWanted = 'INSERT INTO wanted (adId, freight) VALUES (LAST_INSERT_ID(), ?)';

    try {
        const conn = await pool.getConnection();
        const resA = await conn.query(addWantedAd, [description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId]);
        const resW = await conn.query(addWanted, [freight]);
        await conn.release();
        return 1;
    } catch (error) {
        return 0;
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
router.get('/getUserWanted', authenticateToken, async function(req, res, next) {
    try {
      const id = req.user_id;
      const wanted = await getUserWanteds(id);
  
      if (wanted.success) {
        res.status(200);
        res.json({ status: 1, wantedData: wanted.data });
      } else {
        res.status(204).json(null);
      }
    } catch (error) {
        res.status(500);
        res.json({ status: 99, error: 'Fetching Wanted Data failed' });
    }
});

router.post('/createWanted', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        const {description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, freight} = req.body;
        const wanted = await addNewWanted(description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, id, freight);

        if (wanted === 1) {
            res.status(200);
            res.json({ status: 1 });
          } else {
            res.status(500);
            res.json({ status: 0 });
          }
      } catch (error) {
          res.status(500);
          res.json({ status: 99, error: 'Fetching Wanted Data failed' });
      }
});
  


module.exports = { router, getUserWanteds, addNewWanted };