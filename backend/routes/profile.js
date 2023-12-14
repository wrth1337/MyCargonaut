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
    //const uid = getUserId(email);
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userData = 'SELECT * FROM user WHERE userId = ?';
  
    try {
      const conn = await pool.getConnection();
      const resid = await conn.query(uid, [email]);
      const id = resid[0].userId;
      const result = await conn.query(userData, [id]);
      await conn.release();
      console.log('User Data fetched');
  
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

async function getUserId(email) {
    const id = 'SELECT userId FROM user WHERE email = ?';
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(id, [email]);
        await conn.release();
        console.log('User Id fetched');
        console.log(result[0].userId);
        return result[0].userId;
    } catch (error) {
        return error;
    }
}

async function getUserVehicles(email) {
    //const uid = getUserId(email);
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userVehicles = 'SELECT v.name FROM vehicle v JOIN user u ON v.userId = u.userId WHERE v.userId = ?';

    try {
        const conn = await pool.getConnection();
        const resid = await conn.query(uid, [email]);
        const id = resid[0].userId;
        const result = await conn.query(userVehicles, [id]);
        await conn.release();
        console.log('User Vehicles fetched');
        if (result.length > 0) {
            console.log(result[0]);
            return { success: true, data: result[0] };
        } else {
            return { success: false, message: 'Fahrzeug nicht gefunden' };
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        return { success: false, message: 'Fehler bei der Abfrage' };
    }
}

async function getUserOffers(email) {
    //const id = getUserId(email);
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userOffers = 'SELECT * FROM offer o JOIN ad a ON a.adId = o.adId WHERE a.userId = ?';

    try {
        const conn = await pool.getConnection();
        const resid = await conn.query(uid, [email]);
        const id = resid[0].userId;
        const result = await conn.query(userOffers, [id]);
        await conn.release();
        console.log('User Offers fetched');
        return result;
    } catch (error) {
        return error;
    }
}

// ---Routes--- //

router.get('/profile', async function(req, res, next) {
    try {
      const email = req.query.email;
      const user = await getUser(email);
  
      if (user.success) {
        res.json({ status: 1, userData: user.data });
      } else {
        res.json({ status: 0, error: user.message });
      }
    } catch (error) {
        res.json({ status: 0, error: 'failed' });
    }
});
  


module.exports = { router, getUser, getUserId };