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
    const userData = 'SELECT u.firstName, u.lastName, u.birthdate, u.picture, u.description, u.experience, AVG((COALESCE(r.punctuality, 0) + COALESCE(r.agreement, 0) + COALESCE(r.pleasent, 0) + CASE WHEN r.freight IS NOT NULL THEN r.freight ELSE 0 END) / NULLIF(4.0 - CASE WHEN r.freight IS NULL THEN 1 ELSE 0 END, 0)) AS rating FROM user u JOIN rating r ON r.userWhoWasEvaluated = u.userId WHERE u.userId = ?';

    try {
      const conn = await pool.getConnection();
      const resid = await conn.query(uid, [email]);
      const id = resid[0].userId;
      const result = await conn.query(userData, [id]);
      await conn.release();
      console.log('User Data fetched');
      console.log(result[0]);
  
      if (result.length > 0) {
        return { success: true, data: result[0] };
      } else {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
    } catch (error) {
      console.error('Fehler bei der Abfrage:', error);
      return { success: false, message: 'Fehler bei der Abfrage' };
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
 *                example: max@mustermann.com
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
        res.status(200);
        res.json({ status: 0, error: user.message });
      }
    } catch (error) {
        res.status(500);
        res.json({ status: 99, error: 'Fetching Profile Data failed' });
    }
});
  


module.exports = { router, getUser };