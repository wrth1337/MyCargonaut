const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');
const authenticateToken = require('./auth');

// eslint-disable-next-line new-cap
const router = express.Router();
const limiter = rateLimit({
    windowMs: 60 * 1000,
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

async function getUser(id) {
    const userData = `
        SELECT u.firstName, u.lastName, u.birthdate, u.picture, u.description, u.experience,
        AVG((COALESCE(r.punctuality, 0) + COALESCE(r.agreement, 0) + COALESCE(r.pleasent, 0) + 
        CASE WHEN r.freight IS NOT NULL THEN r.freight ELSE 0 END) / NULLIF(4.0 - CASE WHEN r.freight IS NULL THEN 1 ELSE 0 END, 0)) AS rating
        FROM user u LEFT JOIN rating r ON r.userWhoWasEvaluated = u.userId WHERE u.userId = ?`;
    const languages = 'SELECT languageId FROM userLanguage WHERE userId = ?';
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(userData, [id]);
        const lang = await conn.query(languages, [id]);
        await conn.release();

        if (result.length > 0) {
            return {success: true, data: result[0], lang: lang};
        } else {
            return {success: false};
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function editProfile(firstName, lastName, birthdate, picture, description, experience, id, languages) {
    const edit ='UPDATE user SET firstName = ?, lastName = ?, birthdate = ?, picture = ?, description = ?, experience = ? WHERE userId = ?';
    const insertLang = 'INSERT INTO userLanguage(userId, languageId) VALUES (?, ?)';
    const existLang = 'SELECT * FROM userLanguage WHERE languageId = ? AND userId = ?';
    const deleteLang = 'DELETE FROM userLanguage WHERE userId = ? AND languageId = ?';
    try {
        const conn = await pool.getConnection();
        await conn.query(edit, [firstName, lastName, birthdate, picture, description, experience, id]);
        for (const lang of languages) {
            const langExists = await conn.query(existLang, [lang.languageId, id]);
            if (langExists.length === 0 && lang.selected) {
                await conn.query(insertLang, [id, lang.languageId]);
            } else if (langExists.length > 0 && !lang.selected) {
                await conn.query(deleteLang, [id, lang.languageId]);
            }
        }
        await conn.release();
        return 1;
    } catch (error) {
        return 0;
    }
}

async function getUserRating(id) {
    const rating = 'SELECT r.*, u.firstName, u.lastName, u.picture FROM rating r JOIN user u ON u.userId = r.userWhoIsEvaluating WHERE userWhoWasEvaluated = ?';
    try {
        const conn = await pool.getConnection();
        const resRating = await conn.query(rating, [id]);
        await conn.release();

        if (resRating.length > 0) {
            return {success: true, data: resRating};
        } else {
            return {success: false};
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
 * /profile/userdata/{userId}:
 *      get:
 *          summary: get user profile data.
 *          security:
 *              - bearerAuth: []
 *          description: get user profile data.
 *          tags:
 *              - profile
 *          parameters:
 *              - in: path
 *                name: userId
 *                required: true
 *                schema:
 *                  type: string
 *                description: The id of the current user.
 *                example: 1
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
 *                                  languages:
 *                                      type: array
 *                                      items:
 *                                         type: object
 *                                         properties:
 *                                             languageId:
 *                                                  type: integer
 *                                                  description: The id of the language
 *                                      description: The selected languages of the user.
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 * components:
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 * security:
 *  - bearerAuth: []
 */
router.get('/userdata/:id', async function(req, res, next) {
    try {
        const user = await getUser(req.params.id);
        if (user.success) {
            res.status(200);
            res.json({status: 1, userData: user.data, languages: user.lang});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Profile Data failed'});
    }
});

/**
 * @swagger
 * tags:
 *      - name: profile
 *        description: Routes that are connected to the profile of an user.
 * /profile/edit_profile:
 *    post:
 *         summary: Change user profile data.
 *         security:
 *             - bearerAuth: []
 *         description: Change user profile data.
 *         tags:
 *             - profile
 *         requestBody:
 *              description: The changed data of the profile.
 *              content:
 *                    application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - firstName
 *                              - lastName
 *                              - birthdate
 *                              - picture
 *                              - description
 *                              - experience
 *                          properties:
 *                              firstName:
 *                                  type: string
 *                                  description: The first name of the user.
 *                                  example: Vorname
 *                              lastName:
 *                                  type: string
 *                                  description: The last name of the user.
 *                                  example: Nachname
 *                              birthdate:
 *                                  type: string
 *                                  description: The birthdate of the user.
 *                                  example: '2000-01-01'
 *                                  format: date
 *                              picture:
 *                                  type: string
 *                                  description: The profile picture of the user.
 *                                  example: profilepicture.jpg
 *                              description:
 *                                  type: string
 *                                  description: The description of the user.
 *                                  example: Hallo das ist meine Beschreibung.
 *                              experience:
 *                                  type: string
 *                                  description: The experience of the user.
 *                                  example: Hallo das sind meine Erfahrungen.
 *         responses:
 *              200:
 *                  description: user profile data successfully changed.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *              500:
 *                  description: changing user profile data failed.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 * components:
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 * security:
 *  - bearerAuth: []
 */
router.post('/edit_profile', authenticateToken, async function(req, res, next) {
    try {
        const id = req.user_id;
        const {firstName, lastName, birthdate, picture, description, experience, language} = req.body;
        const edit = await editProfile(firstName, lastName, birthdate, picture, description, experience, id, language);

        if (edit === 1) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 0});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Changing Profile Data failed'});
    }
});

async function getUserXP(id) {
    const xp = `
        SELECT b.numSeats
        FROM booking b
        JOIN ad a ON a.adId = b.adId
        WHERE (b.userId = ? AND b.state = 'confirmed' AND b.canceled = FALSE) OR (a.userId = ? AND a.state != 'created' AND b.state != 'denied')`;
    const trips = `SELECT DISTINCT a.adId FROM ad a JOIN booking b ON b.adId = a.adId
        WHERE (a.state != 'created' AND a.userId = ?) OR (b.userId = ?  AND b.canceled = FALSE AND b.state = 'confirmed')`;
    const languages = 'SELECT languageId FROM userLanguage WHERE userId = ?';
    try {
        const conn = await pool.getConnection();
        const resNumSeats = await conn.query(xp, [id, id]);
        const resTrips = await conn.query(trips, [id, id]);
        const lang = await conn.query(languages, [id]);
        await conn.release();
        return {success: true, numSeats: resNumSeats, trips: resTrips, lang: lang};
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

router.get('/experience/:id', async function(req, res, next) {
    try {
        const xp = await getUserXP(req.params.id);
        if (xp.success) {
            res.status(200);
            res.json({status: 1, seats: xp.numSeats, trips: xp.trips, lang: xp.lang});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching User Experience failed'});
    }
});

/**
 * @swagger
 * tags:
 *      - name: profile
 *        description: Routes that are connected to the profile of an user
 * /profile/userrating/{userId}:
 *      get:
 *          summary: get user rating data.
 *          description: get user rating data.
 *          tags:
 *              - profile
 *          parameters:
 *              - in: path
 *                name: userId
 *                required: true
 *                schema:
 *                  type: string
 *                description: The id of the user.
 *                example: 1
 *          responses:
 *              200:
 *                  description: user rating data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  ratingData:
 *                                      type: object
 *                                      description: The user rating data.
 *                                      properties:
 *                                          ratingId:
 *                                               type: number
 *                                               description: The id of the rating.
 *                                          bookingId:
 *                                               type: number
 *                                               description: The id of the booking connected to the rating.
 *                                          userWhoIsEvaluating:
 *                                               type: number
 *                                               description: The id of the user that creates the rating.
 *                                          userWhoWasEvaluated:
 *                                               type: number
 *                                               description: The id of the user that is rated.
 *                                          punctuality:
 *                                               type: number
 *                                               description: The amount of stars awarded for punctuality.
 *                                          agreement:
 *                                               type: number
 *                                               description: The amount of stars awarded for agreement.
 *                                          pleasent:
 *                                               type: number
 *                                               description: The amount of stars awarded for pleasent.
 *                                          freight:
 *                                               type: number
 *                                               description: The amount of stars awarded for freight.
 *                                          comment:
 *                                               type: string
 *                                               description: The comment of the rating.
 *                                          firstName:
 *                                               type: string
 *                                               description: The first name of the user that created the rating.
 *                                          lastName:
 *                                               type: string
 *                                               description: The last name of the user that created the rating.
 *                                          picture:
 *                                               type: string
 *                                               description: The profile picture of the user that created the rating.
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 */
router.get('/userrating/:id', async function(req, res, next) {
    try {
        const rating = await getUserRating(req.params.id);
        if (rating.success) {
            res.status(200);
            res.json({status: 1, ratingData: rating.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Rating Data failed'});
    }
});

module.exports = {router, getUser, editProfile, getUserRating};
