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

async function getUser(email) {
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userData = 'SELECT u.firstName, u.lastName, u.birthdate, u.picture, u.description, u.experience, AVG((COALESCE(r.punctuality, 0) + COALESCE(r.agreement, 0) + COALESCE(r.pleasent, 0) + CASE WHEN r.freight IS NOT NULL THEN r.freight ELSE 0 END) / NULLIF(4.0 - CASE WHEN r.freight IS NULL THEN 1 ELSE 0 END, 0)) AS rating FROM user u LEFT JOIN rating r ON r.userWhoWasEvaluated = u.userId WHERE u.userId = ?';

    try {
      const conn = await pool.getConnection();
      const resid = await conn.query(uid, [email]);
      const id = resid[0].userId;
      const result = await conn.query(userData, [id]);
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

// ---Routes--- //
/**
 * @swagger
 * tags:
 *      - name: profile
 *        description: Routes that are connected to the profile of an user
 * /profile:
 *      get:
 *          summary: get user profile data.
 *          description: get user profile data.
 *          tags:
 *              - profile
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
 *                  description: user profile data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  userData:
 *                                      type: object
 *                                      description: The user profile data.
 *                                      properties:
 *                                          firstName:
 *                                               type: string
 *                                               description: The first name of the user.
 *                                          lastName:
 *                                               type: string
 *                                               description: The last name of the user.
 *                                          birthdate:
 *                                               type: string
 *                                               format: date
 *                                               description: The birthdate of the user.
 *                                          picture:
 *                                               type: string
 *                                               description: The profile picture of the user.
 *                                          description:
 *                                               type: string
 *                                               description: The description of the user.
 *                                          experience:
 *                                               type: string
 *                                               description: The experience of the user.
 *                                          rating:
 *                                               type: string
 *                                               description: The rating of the user.
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 */
router.get('/profile', async function(req, res, next) {
    try {
      const email = req.query.email;
      const user = await getUser(email);
  
      if (user.success) {
        console.log(user.data);
        res.status(200);
        res.json({ status: 1, userData: user.data });
      } else {
        res.status(204).json(null);
        //res.json({ status: 0 });
      }
    } catch (error) {
        res.status(500);
        res.json({ status: 99, error: 'Fetching Profile Data failed' });
    }
});
  


module.exports = { router, getUser };