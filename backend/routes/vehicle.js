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
    host: 'database',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

// ---Methods--- //


async function getUserVehicles(id) {
    const userVehicles = 'SELECT * FROM vehicle WHERE userId = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(userVehicles, [id]);
        await conn.release();
        if (result.length > 0) {
            return {success: true, data: result};
        } else {
            return {success: false};
        }
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function newUserVehicle(userId, name, numSeats, maxWeight, loadingAreaDimensions, specialFeatures) {
    const insert = `INSERT INTO vehicle (userId, name, numSeats, maxWeight, loadingAreaDimensions, specialFeatures) VALUES (?,?,?,?,?,?);`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(insert, [userId, name, numSeats, maxWeight, loadingAreaDimensions, specialFeatures]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function updateUserVehicle(userId, vehicleId, name, numSeats, maxWeight, loadingAreaDimensions, specialFeatures) {
    const update = `UPDATE vehicle SET name = ?, numSeats = ?, maxWeight = ?, loadingAreaDimensions = ?, specialFeatures = ? WHERE vehicleId = ? AND userId = ?;`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(update, [name, numSeats, maxWeight, loadingAreaDimensions, specialFeatures, vehicleId, userId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}

async function deleteUserVehicle(userId, vehicleId) {
    const del = `DELETE FROM vehicle WHERE vehicleId = ? AND userId = ?;`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(del, [vehicleId, userId]);
        await conn.release();
        return result;
    } catch (error) {
        console.error('Fehler bei der Abfrage:', error);
        throw error;
    }
}
// ---Routes--- //
/**
 * @swagger
 * tags:
 *      - name: vehicle
 *        description: Routes that are connected to the vehicles of an user
 * /vehicle/{userId}:
 *      get:
 *          summary: get user vehicles by user Id.
 *          security:
 *              - bearerAuth: []
 *          description: get a list of the user vehicles.
 *          tags:
 *              - vehicle
 *          parameters:
 *              - in: path
 *                name: userId
 *                required: true
 *                schema:
 *                  type: number
 *                description: The id of the current user.
 *                example: 1
 *          responses:
 *              200:
 *                  description: user vehicle data successfully fetched.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  vehicleData:
 *                                      type: array
 *                                      description: The user vehicle data.
 *                                      items:
 *                                        $ref: '#/components/schemas/vehicle'
 *              204:
 *                  description: query was successful but contains no content.
 *                  content: {}
 *      post:
 *          summary: post a new vehicle.
 *          security:
 *              - bearerAuth: []
 *          description: Posts a new vehicle specific to the logged in users.
 *          tags:
 *              - vehicle
 *          requestBody:
 *              description: The data of the new vehicle.
 *              content:
 *                    application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - name
 *                              - numseats
 *                              - maxWeight
 *                              - loadingAreaDimensions
 *                              - specialFeatures
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: The name of the new vehicle.
 *                                  example: greatCar
 *                              numSeats:
 *                                  type: number
 *                                  description: The number of seats in the new vehicle.
 *                                  example: 4
 *                              maxWeight:
 *                                  type: number
 *                                  description: The maximal Weight of storage of the new vehicle in kg.
 *                                  example: 50
 *                              loadingAreaDimensions:
 *                                  type: string
 *                                  description: The Dimensions of storage of the new vehicle.
 *                                  example: 5
 *                              specialFeatures:
 *                                  type: string
 *                                  description: Speacial Features of the new vehicle as a descriptive string.
 *                                  example: cooling unit
 *          responses:
 *              200:
 *                  description: Insert succesfull.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *              500:
 *                  description: Insert failed.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  error:
 *                                      type: string
 *                                      description: The error message.
 *              401:
 *                  description: Unauthorized.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  message:
 *                                      type: string
 *                                      description: Unauthorized.
 * /vehicle/{vehicleId}:
 *      post:
 *          summary: update a vehicle.
 *          security:
 *              - bearerAuth: []
 *          description: Update a vehicle of the authorized user by its Id.
 *          tags:
 *              - vehicle
 *          parameters:
 *            - in: path
 *              name: vehicleId
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the vehicle to update.
 *          requestBody:
 *              description: The data of the new vehicle.
 *              content:
 *                    application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - name
 *                              - numseats
 *                              - maxWeight
 *                              - loadingAreaDimensions
 *                              - specialFeatures
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: The name of the new vehicle.
 *                                  example: greatCar
 *                              numSeats:
 *                                  type: number
 *                                  description: The number of seats in the new vehicle.
 *                                  example: 4
 *                              maxWeight:
 *                                  type: number
 *                                  description: The maximal Weight of storage of the new vehicle in kg.
 *                                  example: 50
 *                              loadingAreaDimensions:
 *                                  type: string
 *                                  description: The Dimensions of storage of the new vehicle.
 *                                  example: 5
 *                              specialFeatures:
 *                                  type: string
 *                                  description: Speacial Features of the new vehicle as a descriptive string.
 *                                  example: cooling unit
 *          responses:
 *              200:
 *                  description: Upate succesfull.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *              500:
 *                  description: Update failed.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  error:
 *                                      type: string
 *                                      description: The error message.
 *              401:
 *                  description: Unauthorized.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  message:
 *                                      type: string
 *                                      description: Unauthorized.
 *      delete:
 *          summary: Deletes a vehicle.
 *          security:
 *              - bearerAuth: []
 *          description: Deletes a vehicle of the authorized user by its Id.
 *          tags:
 *              - vehicle
 *          parameters:
 *            - in: path
 *              name: vehicleId
 *              schema:
 *                  type: integer
 *              required: true
 *              description: The Id of the vehicle to delete
 *          responses:
 *              200:
 *                  description: Delete succesfull.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *              500:
 *                  description: Delete failed.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  error:
 *                                      type: string
 *                                      description: The error message.
 *              401:
 *                  description: Unauthorized.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  message:
 *                                      type: string
 *                                      description: Unauthorized.
 * components:
 *      schemas:
 *          vehicle:
 *              type: object
 *              properties:
 *                  name:
 *                      type: string
 *                      description: The name of the vehicle.
 *      securitySchemes:
 *          bearerAuth:
 *              type: http
 *              scheme: bearer
 *              bearerFormat: JWT
 * security:
 *  - bearerAuth: []
 */

router.get('/vehicle/:id', async function(req, res, next) {
    try {
        const id = req.params.id;
        const vehicle = await getUserVehicles(id);
        if (vehicle.success) {
            res.status(200);
            res.json({status: 1, vehicleData: vehicle.data});
        } else {
            res.status(204).json(null);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Fetching Vehicle Data failed'});
    }
});

router.post('/vehicle', authenticateToken, async function(req, res, next) {
    try {
        const userId = req.user_id;
        const {name, numSeats, maxWeight, loadingAreaDimensions, specialFeatures} = req.body;
        const result = await newUserVehicle(userId, name, numSeats, maxWeight, loadingAreaDimensions, specialFeatures);
        if (result) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Storing Vehicle Data failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Storing Vehicle Data failed'});
    }
});

router.post('/vehicle/:id', authenticateToken, async function(req, res, next) {
    try {
        const userId = req.user_id;
        const vehicleId = req.params.id;
        const {name, numSeats, maxWeight, loadingAreaDimensions, specialFeatures} = req.body;
        const result = await updateUserVehicle(userId, vehicleId, name, numSeats, maxWeight, loadingAreaDimensions, specialFeatures);
        if (result.affectedRows > 0) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Updating Vehicle Data failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Updating Vehicle Data failed'});
    }
});

router.delete('/vehicle/:id', authenticateToken, async function(req, res, next) {
    try {
        const userId = req.user_id;
        const vehicleId = req.params.id;
        const result = await deleteUserVehicle(userId, vehicleId);
        if (result.affectedRows > 0) {
            res.status(200);
            res.json({status: 1});
        } else {
            res.status(500);
            res.json({status: 99, error: 'Deleting Vehicle Data failed'});
        }
    } catch (error) {
        res.status(500);
        res.json({status: 99, error: 'Deleting Vehicle Data failed'});
    }
});

module.exports = {router, getUserVehicles, newUserVehicle, updateUserVehicle, deleteUserVehicle};
