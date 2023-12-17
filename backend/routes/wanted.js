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
    //const id = getUserId(email);
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userWanted = 'SELECT a.adId, a.startLocation, a.endLocation, a.startDate, a.endDate, w.freight FROM ad a JOIN wanted w ON w.adId = a.adId WHERE a.userId = ?';

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
            return { success: false, message: 'Keine Gesuche vorhanden' };
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        return { success: false, error: 'Fehler bei der Abfrage' };
    }
}

// ---Routes--- //

router.get('/wanted', async function(req, res, next) {
    try {
      const email = req.query.email;
      const wanted = await getUserWanteds(email);
  
      if (wanted.success) {
        console.log(wanted.data);
        res.json({ status: 1, wantedData: wanted.data });
      } else {
        res.json({ status: 0, message: wanted.message });
      }
    } catch (error) {
        res.json({ status: 0, error: 'failed' });
    }
});
  


module.exports = { router, getUserWanteds };