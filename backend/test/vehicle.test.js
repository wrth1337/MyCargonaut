const {expect, test, afterAll} = require('@jest/globals');
const vehicle = require('../routes/vehicle');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test.skip('Create/ Update / Delete a vehicle', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (999999,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        const res = (await vehicle.newUserVehicle(999999, 'TestName', 4, 50, '1m x 1m x 1m', 'Special Features'));
        expect(res.affectedRows).toEqual(1);

        const res2 = await vehicle.updateUserVehicle(999999, res.insertId, 'TestName', 4, 50, '1m x 1m x 1m', 'Special Features');
        expect(res2.affectedRows).toEqual(1);

        const res3 = await vehicle.deleteUserVehicle(999999, res.insertId);
        expect(res3.affectedRows).toEqual(1);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 999999`);

        if (conn) await conn.release();
    }
});

test('Get all vehicle for one User', async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) \
        VALUES (999999,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung')`);

        const res = await vehicle.newUserVehicle(999999, 'TestName', 4, 50, '1m x 1m x 1m', 'Special Features');
        const startAmount = (await vehicle.getUserVehicles(999999)).data.length;
        const res2 = await vehicle.newUserVehicle(999999, 'TestName2', 4, 50, '1m x 1m x 1m', 'Special Features');
        let amount = (await vehicle.getUserVehicles(999999)).data.length;

        expect(amount).toBe(startAmount + 1);

        await vehicle.deleteUserVehicle(999999, res.insertId);
        amount = (await vehicle.getUserVehicles(999999)).data.length;

        expect(amount).toBe(startAmount);

        await vehicle.deleteUserVehicle(999999, res2.insertId);
    } finally {
        conn.query(`DELETE FROM user WHERE userId = 999999`);
        if (conn) await conn.release();
    }
});

afterAll(() => {
    pool.end((err) => {
        if (err) {
            console.error('Fehler beim Schließen der Datenbankverbindung:', err);
        } else {
            console.log('Datenbankverbindung erfolgreich geschlossen.');
        }
    });
});
