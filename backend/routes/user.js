const mariadb = require('mariadb');
const express = require('express');
const rateLimit = require('express-rate-limit');
const {zxcvbn, zxcvbnOptions} = require('@zxcvbn-ts/core');
const zxcvbnCommonPackage = require('@zxcvbn-ts/language-common');
const zxcvbnEnPackage = require('@zxcvbn-ts/language-en');
const zxcvbnDePackage = require('@zxcvbn-ts/language-de');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

// eslint-disable-next-line new-cap
const router = express.Router();

// Express Limiter
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
});
router.use(limiter);

// Database settings
const pool = mariadb.createPool({
    host: 'database',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

// ZXCVBN settings
const zxcvbnSettings = {
    translations: zxcvbnDePackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
        ...zxcvbnDePackage.dictionary,
    },
};

// JWT settings
const jwtSecret = process.env.JWT_SECRET || 'TEST_DEV_SECRET';

// ---Methods--- //
async function registerNewUser(firstName, lastName, email, password, birthdate, phonenumber) {
    const hashedPassword = await argon2.hash(password);
    const newUser ='INSERT INTO user (firstName, lastName, email, password, birthdate, phonenumber, coins) VALUES (?, ?, ?, ?, ?, ?, 0)';
    try {
        const conn = await pool.getConnection();
        // eslint-disable-next-line no-unused-vars
        const result = await conn.query(newUser, [firstName, lastName, email, hashedPassword, birthdate, phonenumber]);
        await conn.release();
        return 0;
    } catch (error) {
        return 1;
    }
}

async function isUserAlreadyRegistered(email) {
    const checkUsername = 'SELECT COUNT(*) AS count FROM user WHERE email = ?';

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(checkUsername, [email]);
        await conn.release();
        return (result[0].count > 0);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function isEmailValid(email) {
    // eslint-disable-next-line max-len
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regexEmail.test(email);
}

async function isDateValid(birthdate) {
    const regexBirthdate = /[0-9][0-9][0-9][0-9]-(0[0-9]|1[0-2])-(0[0-9]|1[0-9]|2[0-9]|3[0-1])/;
    return regexBirthdate.test(birthdate);
}

async function isOver18yo(birthdate) {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age >= 18;
}

async function isPhonenumberValid(phonenumber) {
    const regexPhonenumber = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
    return regexPhonenumber.test(phonenumber);
}

// ---Routes--- //
/**
 * @swagger
 * tags:
 *      - name: user
 *        description: Routes that are connected to the user.
 * /register:
 *      post:
 *          summary: Create a new user.
 *          description: Create a new user.
 *          tags:
 *              - user
 *          parameters:
 *              - in: query
 *                name: firstName
 *                required: true
 *                schema:
 *                  type: string
 *                description: The Firstname of the user to be created.
 *                example: Gabe
 *              - in: query
 *                name: lastName
 *                required: true
 *                schema:
 *                  type: string
 *                description: The Lastname of the user to be created.
 *                example: Newell
 *              - in: query
 *                name: email
 *                required: true
 *                schema:
 *                  type: string
 *                description: The email-address of the user to be created.
 *                example: gaben@valvesoftware.com
 *              - in: query
 *                name: passwords
 *                required: true
 *                schema:
 *                  type: string
 *                description: The chosen password of the user to be created.
 *                example: gi#$giOsdjw!sj2xS
 *              - in: query
 *                name: birthdate
 *                required: true
 *                schema:
 *                  type: string
 *                  format: date
 *                description: The birthdate of the user to be created.
 *                example: 03-11-1962
 *              - in: query
 *                name: phonenumber
 *                required: true
 *                schema:
 *                  type: string
 *                description: The phonenumber of the user to be created.
 *                example: 1234566789
 *          responses:
 *              201:
 *                  description: User successfully created.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  msg:
 *                                      type: string
 *                                      description: A brief description about the successfull registration.
 *              409:
 *                  description: User with the same email-address already exists.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: integer
 *                                      description: The status-code.
 *                                  msg:
 *                                      type: string
 *                                      description: A brief description of the error.
 *              422:
 *                  description: Password is too weak.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              oneOf:
 *                                  - $ref: '#/components/schemas/normal-message'
 *                                  - $ref: '#/components/schemas/zxcvbn-message'
 *
 * components:
 *      schemas:
 *          normal-message:
 *              type: object
 *              properties:
 *                  status:
 *                      type: integer
 *                      description: The status-code.
 *                  msg:
 *                      type: string
 *                      description: A brief description of the error.
 *          zxcvbn-message:
 *              type: object
 *              properties:
 *                  status:
 *                      type: integer
 *                      description: The status-code.
 *                  score:
 *                      type: integer
 *                      description: The security-score of the given (bad) password.
 *                  feedback:
 *                      type: string
 *                      description: The feedback for the given (bad) password.
 */
router.post('/register', async function(req, res, next) {
    const conn = await pool.getConnection();
    zxcvbnOptions.setOptions(zxcvbnSettings);
    try {
        const {firstName, lastName, email, password, birthdate, phonenumber} = req.body;
        const zxcvbnResults = zxcvbn(password, [firstName, lastName, email, birthdate, phonenumber]);
        const zxcvbnScore = zxcvbnResults.score;
        const zxcvbnFeedback = zxcvbnResults.feedback;
        if (!await isPhonenumberValid(phonenumber)) {
            res.status(422);
            res.send({status: 3, msg: 'No valid phonenumber'});
        } else if (!await isEmailValid(email)) {
            res.status(422);
            res.send({status: 4, msg: 'No valid email'});
        } else if (!await isDateValid(birthdate)) {
            res.status(422);
            res.send({status: 5, msg: 'No valid birthdate'});
        } else if (!await isOver18yo(birthdate)) {
            res.status(422);
            res.send({status: 6, msg: 'No valid birthdate: Must be over 18 yo.'});
        } else if (zxcvbnScore <= 2) {
            res.status(422);
            res.send({status: 2, score: zxcvbnScore, feedback: zxcvbnFeedback});
        } else {
            const userExists = await isUserAlreadyRegistered(email);
            if (userExists) {
                res.status(409);
                res.send({status: 1, msg: 'Your email is already taken.'});
            } else {
                // eslint-disable-next-line no-unused-vars
                const newUser = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);
                res.status(201);
                res.send({status: 0, msg: 'User created'});
            }
        }
    } catch (error) {
        res.status(500);
        res.send({status: 99, error: 'Registration failed'});
    } finally {
        if (conn) await conn.release();
    }
});

/**
 * @swagger
 * /login:
 *      post:
 *          summary: Login as an existing user.
 *          description: Login as an existing user.
 *          tags:
 *              - user
 *          parameters:
 *              - in: query
 *                name: email
 *                required: true
 *                schema:
 *                  type: string
 *                description: The email of the user.
 *                example: Leet@Krew.de
 *              - in: query
 *                name: password
 *                required: true
 *                schema:
 *                  type: string
 *                description: The password of the user.
 *                example: L33tH4xx0r!
 *          responses:
 *              200:
 *                  description: Response of the login-attempt. Notice, The status-code is always 200 due to security-reasons, wether it was successfull or not.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              oneOf:
 *                                  - $ref: '#/components/schemas/login-success'
 *                                  - $ref: '#/components/schemas/login-error'
 *
 * components:
 *      schemas:
 *          login-success:
 *              type: object
 *              properties:
 *                  status:
 *                      type: integer
 *                      description: The status-code.
 *                  data:
 *                      type: object
 *                      description: The data of the logged-in user.
 *                      properties:
 *                          email:
 *                              type: string
 *                              description: The email of the logged-in user.
 *                          user_id:
 *                              type: integer
 *                              description: The ID of the logged-in user.
 *                  token:
 *                      type: string
 *                      description: The JW-Token of the logged-in user.
 *          login-error:
 *              type: object
 *              properties:
 *                  status:
 *                      type: integer
 *                      description: The status-code.
 *                  error:
 *                      type: string
 *                      description: The error-message.
 */
router.post('/login', async function(req, res, next) {
    const conn = await pool.getConnection();
    try {
        const {email, password} = req.body;

        const getUserData = `SELECT * FROM user WHERE email = ?`;
        const result = await conn.query(getUserData, [email]);

        if (result.length > 0) {
            const hashedPassword = result[0].password;
            const passwordIsCorrect = await argon2.verify(hashedPassword, password.toString());
            if (passwordIsCorrect) {
                const token = jwt.sign({email: email, user_id: result[0].userId}, jwtSecret, {expiresIn: '1h'});
                res.status(200);
                res.send({status: 1, data: {email, user_id: result[0].userId}, token: token});
            } else {
                res.status(200);
                res.send({status: 0, error: 'error'});
            }
        } else {
            res.status(200);
            res.send({status: 0, error: 'error'});
        }
    } catch (error) {
        res.status(200);
        res.send({status: 0, error: 'error'});
    } finally {
        if (conn) conn.release();
    }
});

module.exports = {router, registerNewUser, isUserAlreadyRegistered, isEmailValid, isPhonenumberValid, isDateValid, isOver18yo};
