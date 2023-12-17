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

async function getUserOffers(email) {
    //const id = getUserId(email);
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userOffers = 'SELECT a.adId, a.startLocation, a.endLocation, a.startDate, a.endDate FROM ad a JOIN offer o ON o.adId = a.adId WHERE userId = ?';

    try {
        const conn = await pool.getConnection();
        const resid = await conn.query(uid, [email]);
        const id = resid[0].userId;
        const result = await conn.query(userOffers, [id]);
        await conn.release();
        console.log('User Offers fetched');
        if (result.length > 0) {
            console.log(result);
            return { success: true, data: result };
        } else {
            return { success: false, message: 'Keine Angebote vorhanden' };
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        return { success: false, error: 'Fehler bei der Abfrage' };
    }
}

// ---Routes--- //

router.get('/offer', async function(req, res, next) {
    try {
      const email = req.query.email;
      const offer = await getUserOffers(email);
  
      if (offer.success) {
        console.log(offer.data);
        res.json({ status: 1, offerData: offer.data });
      } else {
        res.json({ status: 0, error: offer.message });
      }
    } catch (error) {
        res.json({ status: 0, error: 'failed' });
    }
});
  


module.exports = { router, getUserOffers };