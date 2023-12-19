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

async function getUserTrips(email) {
    //const id = getUserId(email);
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userWantedTrips = 'SELECT a.startLocation, a.endLocation, a.startDate FROM ad a JOIN wanted w ON w.adId = a.adId JOIN booking b ON b.adId = a.adId JOIN status s ON s.bookingId = b.bookingId WHERE s.endRide = TRUE AND a.userId = ?';
    const userOfferedTrips = 'SELECT a.startLocation, a.endLocation, a.startDate FROM ad a JOIN offer o ON o.adId = a.adId JOIN booking b ON b.adId = a.adId JOIN status s ON s.bookingId = b.bookingId WHERE s.endRide = TRUE AND a.userId = ?';

    try {
        const conn = await pool.getConnection();
        const resid = await conn.query(uid, [email]);
        const id = resid[0].userId;
        const uwtresult = await conn.query(userWantedTrips, [id]);
        const uotresult = await conn.query(userOfferedTrips, [id]);
        await conn.release();
        console.log('User Trips fetched');
        if (uwtresult.length > 0 || uotresult.length > 0) {
            return { success: true, uwtdata: uwtresult, uotData: uotresult };
        } else {
            return { success: false, message: 'Keine Fahrten vorhanden' };
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        return { success: false, error: 'Fehler bei der Abfrage' };
    }
}

// ---Routes--- //

router.get('/trip', async function(req, res, next) {
    try {
      const email = req.query.email;
      const trip = await getUserTrips(email);
  
      if (trip.success) {
        console.log(trip);
        res.json({ status: 1, uwtData: trip.uwtdata, uotData: trip.uotData });
      } else {
        res.json({ status: 0, message: trip.message });
      }
    } catch (error) {
        res.json({ status: 0, error: 'failed' });
    }
});
  


module.exports = { router, getUserTrips };