const {expect, test, beforeEach, afterEach} = require('@jest/globals');
const {router, getFilteredAds} = require('../routes/searchbar');
const mariadb = require('mariadb');

let adIdFromFirstInsert;

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

beforeEach(async() => {
    const conn = await pool.getConnection();

    const firstVehicleIdResult = await conn.query('INSERT INTO vehicle (name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeautures, userId) VALUES (?,?,?,?,?,?,?)', ['Lightning McQueen', 2, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 1]);
    const firstVehicleId = firstVehicleIdResult.insertId;

    const firstAdInsertResult = await conn.query('INSERT INTO ad (startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId) VALUES (?,?,?,?,?,?,?,?,?)', ['City A', 'City B', '2023-01-10', '2023-01-10', 0, 1, 'No pets allowed', 4, 1]);
    adIdFromFirstInsert = firstAdInsertResult.insertId;

    await conn.query('INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (?,?,?,?)', [firstVehicleId, adIdFromFirstInsert, 50.0, 100.0]);
    const bookingIdFromQuery = await conn.query('INSERT INTO booking (adId, userId, price, numSeats, canceled) VALUES (?, ?, ?, ?, ?)', [adIdFromFirstInsert, 1, 10.0, 1, false]);
    const bookingId = bookingIdFromQuery.insertId;

    await conn.query('INSERT INTO rating (bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) VALUES (?,?,?,?,?,?,?,?)', [bookingId, 2, 1, 5, 4, 5, null, 'Great service']);

});

afterEach(async() => {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM offer;');
    await conn.query('DELETE FROM ad;');
    await conn.query('DELETE FROM vehicle;');
    await conn.query('DELETE FROM booking;');
    await conn.query('DELETE FROM rating;');
    await conn.release();
});

test('get all offers', async() => {

    const result = await getFilteredAds('offer', null, null, null, null, null, null);

    expect(result).toEqual([{adId: Number(adIdFromFirstInsert)}]);
});

test('get all offers with startLocation x', async () => {
    const result = await getFilteredAds('offer', 'City A', null, null, null, null, null);
    expect(result).toEqual([{adId: Number(adIdFromFirstInsert)}]);
});

test('get all offers with startLocation City A', async () => {
    const result = await getFilteredAds('offer', 'City A', null, null, null, null, null);
    expect(result).toEqual([{adId: Number(adIdFromFirstInsert)}]);
});

test('get all offers with startLocation City A and Endlocation City B', async () => {
    const result = await getFilteredAds('offer', 'City A', 'City B', null, null, null, null);
    expect(result).toEqual([{adId: Number(adIdFromFirstInsert)}]);
});

test('get all offers with startLocation City A and Endlocation City B and date', async () => {
    const result = await getFilteredAds('offer', 'City A', 'City B', '2023-01-10', null, null, null);

    expect(result).toEqual([{adId: Number(adIdFromFirstInsert)}]);
});

test('get all offers with startLocation City A and Endlocation City B and date and freight', async () => {
    const result = await getFilteredAds('offer', 'City A', 'City B', '2023-01-10', 1, null, null);
    expect(result).toEqual([{adId: Number(adIdFromFirstInsert)}]);
});

test('get all offers with startLocation City A and Endlocation City B and date and freight and num seats of at least 2', async () => {
    const result = await getFilteredAds('offer', 'City A', 'City B', '2023-01-10', 1, 2, 3.0);
    expect(result).toEqual([{adId: Number(adIdFromFirstInsert)}]);
});

test('get all offers with startLocation City C and Endlocation City D', async () => {
    const result = await getFilteredAds('offer', 'City C', 'City D', null, null, null);
    expect(result).toEqual([]);
});
