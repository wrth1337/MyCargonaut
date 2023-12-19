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
    //const uid = getUserId(email);
    const uid = 'SELECT userId FROM user WHERE email = ?';
    const userVehicles = 'SELECT name FROM vehicle WHERE userId = ?';

    try {
        const conn = await pool.getConnection();
        const resid = await conn.query(uid, [email]);
        const id = resid[0].userId;
        const result = await conn.query(userVehicles, [id]);
        await conn.release();
        console.log('User Vehicles fetched');
        if (result.length > 0) {
            console.log(result[0].name);
            return { success: true, data: result };
        } else {
            return { success: false, message: 'Keine Fahrzeuge vorhanden' };
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        return { success: false, error: 'Fehler bei der Abfrage' };
    }
}

// ---Routes--- //


router.get('/vehicle', async function(req, res, next) {
    try {
      const email = req.query.email;
      const vehicle = await getUserVehicles(email);
      if (vehicle.success) {
        console.log(vehicle.data);
        res.json({ status: 1, vehicleData: vehicle.data });
      } else {
        res.json({ status: 0, message: vehicle.message });
      }
    } catch (error) {
        res.json({ status: 0, error: 'failed' });
    }
});


module.exports = { router, getUserVehicles };