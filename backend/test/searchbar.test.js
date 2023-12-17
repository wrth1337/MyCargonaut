const {expect, test} = require('@jest/globals');
const {router, getFilteredAds} = require('../routes/searchbar');
const mariadb = require('mariadb');
const {isUserAlreadyRegistered} = require("../routes/user");

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('get all offers', async() => {
    const conn = await pool.getConnection();

    const firstVehicleIdResult = await conn.query('INSERT INTO vehicle (name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeautures, userId) VALUES (?,?,?,?,?,?,?)', ['Lightning McQueen', 2, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 1]);
    const firstVehicleId = firstVehicleIdResult.insertId;

    const firstAdInsertResult = await conn.query('INSERT INTO ad (startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?)', ['City A', 'City B', '2023-01-10', '2023-01-10', 0, 1, 'No pets allowed', 4, 1]);
    const adIdFromFirstInsert = firstAdInsertResult.insertId;

    await conn.query('INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?,?,?,?)', [firstVehicleId, adIdFromFirstInsert, 50.0, 100.0]);
    const bookingIdFromQuery = await conn.query('INSERT INTO booking (adId, userId, price, numSeats, canceled) VALUES (?, ?, ?, ?, ?)', [adIdFromFirstInsert, 1, 10.0, 1, false]);
    const bookingId = bookingIdFromQuery.insertId;

    await conn.query('INSERT INTO rating (bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) VALUES (?,?,?,?,?,?,?,?)', [bookingId, 2, 1, 5, 4, 5, null, 'Great service']);

    const result = await getFilteredAds('offer', null, null, null, null, null, null);
    await conn.query('DELETE FROM offer;');
    await conn.query('DELETE FROM ad;');
    await conn.query('DELETE FROM vehicle;');
    await conn.query('DELETE FROM booking;');
    await conn.query('DELETE FROM rating;');
    await conn.release();
    expect(result).toEqual([{adId: adIdFromFirstInsert}]);
});

test('get all offers with startLocation x', async () => {
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO ad (startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?)', ['City A', 'City B', '2023-01-10', '2023-01-10', 0, 1, 'No pets allowed', 4, 1]);
  //  await conn.query('INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?,?,?,?)', [2, 1, 50.0, 100.0]);
    const result = await getFilteredAds('offer', 'City A', null, null, null, null, null);
    await conn.query('DELETE FROM ad;');
    await conn.release();
    expect(result).toEqual([{ adId: 33 }]);
});
test('get all offers with startLocation City A', async () => {
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO ad (startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?)', ['City A', 'City B', '2023-01-10', '2023-01-10', 0, 1, 'No pets allowed', 4, 1]);
    await conn.query('INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?,?,?,?)', [2, 1, 50.0, 100.0]);
    const result = await getFilteredAds('offer', 'City A', null, null, null, null, null);
    await conn.query('DELETE FROM offer;');
    await conn.query('DELETE FROM ad;');
    await conn.release();
    expect(result).toEqual([{ adId: 33 }]);
});
test('get all offers with startLocation City A and Endlocation City B', async () => {
    const conn = await pool.getConnection();
    const firstAdInsertResult = await conn.query('INSERT INTO ad (startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?)', ['City A', 'City B', '2023-01-10', '2023-01-10', 0, 1, 'No pets allowed', 4, 1]);
    const adIdFromFirstInsert = firstAdInsertResult.insertId;
    await conn.query('INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?,?,?,?)', [2, adIdFromFirstInsert, 50.0, 100.0]);
    const result = await getFilteredAds('offer', 'City A', 'City B', null, null, null, null);
    await conn.query('DELETE FROM offer;');
    await conn.query('DELETE FROM ad;');
    await conn.release();
    expect(result).toEqual([{adId: adIdFromFirstInsert}]);
});

test('get all offers with startLocation City A and Endlocation City B and date', async () => {
    const conn = await pool.getConnection();
    const firstAdInsertResult = await conn.query('INSERT INTO ad (startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?)', ['City A', 'City B', '2023-01-10', '2023-01-10', 0, 1, 'No pets allowed', 4, 1]);
    const adIdFromFirstInsert = firstAdInsertResult.insertId;
    await conn.query('INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?,?,?,?)', [2, adIdFromFirstInsert, 50.0, 100.0]);
    const result = await getFilteredAds('offer', 'City A', 'City B', '2023-01-10', null, null, null);
    await conn.query('DELETE FROM offer;');
    await conn.query('DELETE FROM ad;');
    await conn.release();
    expect(result).toEqual([{adId: adIdFromFirstInsert}]);
});

test('get all offers with startLocation City A and Endlocation City B and date and freight', async () => {
    const conn = await pool.getConnection();

    const firstVehicleIdResult = await conn.query('INSERT INTO vehicle (name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeautures, userId) VALUES (?,?,?,?,?,?,?)', ['Lightning McQueen', 2, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 1]);
    const firstVehicleId = firstVehicleIdResult.insertId;

    const firstAdInsertResult = await conn.query('INSERT INTO ad (startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?)', ['City A', 'City B', '2023-01-10', '2023-01-10', 0, 1, 'No pets allowed', 4, 1]);
    const adIdFromFirstInsert = firstAdInsertResult.insertId;

    await conn.query('INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?,?,?,?)', [firstVehicleId, adIdFromFirstInsert, 50.0, 100.0]);
    const result = await getFilteredAds('offer', 'City A', 'City B', '2023-01-10', 1, null, null);
    await conn.query('DELETE FROM offer;');
    await conn.query('DELETE FROM ad;');
    await conn.query('DELETE FROM vehicle;');
    await conn.release();
    expect(result).toEqual([{adId: adIdFromFirstInsert}]);
});

test('get all offers with startLocation City A and Endlocation City B and date and freight and num seats of at least 2', async () => {
    const conn = await pool.getConnection();

    const firstVehicleIdResult = await conn.query('INSERT INTO vehicle (name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeautures, userId) VALUES (?,?,?,?,?,?,?)', ['Lightning McQueen', 2, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 1]);
    const firstVehicleId = firstVehicleIdResult.insertId;

    const firstAdInsertResult = await conn.query('INSERT INTO ad (startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?)', ['City A', 'City B', '2023-01-10', '2023-01-10', 0, 1, 'No pets allowed', 4, 1]);
    const adIdFromFirstInsert = firstAdInsertResult.insertId;

    await conn.query('INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?,?,?,?)', [firstVehicleId, adIdFromFirstInsert, 50.0, 100.0]);
    const bookingIdFromQuery = await conn.query('INSERT INTO booking (adId, userId, price, numSeats, canceled) VALUES (?, ?, ?, ?, ?)', [adIdFromFirstInsert, 1, 10.0, 1, false]);
    const bookingId = bookingIdFromQuery.insertId;

    await conn.query('INSERT INTO rating (bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) VALUES (?,?,?,?,?,?,?,?)', [bookingId, 2, 1, 5, 4, 5, null, 'Great service']);

    const result = await getFilteredAds('offer', 'City A', 'City B', '2023-01-10', 1, 2, 3.0);
    await conn.query('DELETE FROM offer;');
    await conn.query('DELETE FROM ad;');
    await conn.query('DELETE FROM vehicle;');
    await conn.query('DELETE FROM booking;');
    await conn.query('DELETE FROM rating;');
    await conn.release();
    expect(result).toEqual([{adId: adIdFromFirstInsert}]);
});
