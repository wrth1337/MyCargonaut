const {expect, test, afterAll} = require('@jest/globals');
const {registerNewUser} = require('../routes/user');
const {getUser, editProfile, getUserRating, getUserXP} = require('../routes/profile');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('get profile data from new registered user', async () => {
    const firstName = 'profileTestFirstName';
    const lastName = 'profileTestLastName';
    const email = 'profileTestEmail@test.com';
    const password = 'profileTestPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

    expect(result).toBe(0);

    let conn;

    try {
        conn = await pool.getConnection();

        const id = await conn.query('SELECT userId FROM user WHERE email = ?', [email]);
        const userId = id[0].userId;

        const dbResult = await getUser(userId);

        expect(dbResult.data.firstName).toEqual(firstName);
        expect(dbResult.data.lastName).toEqual(lastName);

        expect(dbResult.data.birthdate).toEqual(new Date(birthdate));

        expect(dbResult.data.description).toBeNull();
        expect(dbResult.data.experience).toBeNull();
        expect(dbResult.data.rating).toEqual('0.00000000');
        expect(dbResult.lang.length).toEqual(0);
    } finally {
        if (conn) await conn.release();
    }

    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM user WHERE email = ?', [email]);
    } finally {
        if (conn) await conn.release();
    }
});

test('change profile data from user', async () => {
    const firstName = 'profileTestFirstName';
    const lastName = 'profileTestLastName';
    const email = 'profileTestEmail@test.com';
    const password = 'profileTestPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const description = 'profileTestDescription';
    const experience = 'profileTestExperience';
    const newFirstName = 'profileTestFirstName2';
    const newLastName = 'profileTestLastName2';
    const newBirthdate = '1990-01-02';
    const picture = 'testPicture.jpg';

    const language = [];

    const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

    expect(result).toBe(0);

    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO language(languageName, languagePicture) VALUES  ('Deutsch', 'deutschlandflagge.jpg'), ('Englisch', 'americanflag.jpg')`);
        const id = await conn.query('SELECT userId FROM user WHERE email = ?', [email]);
        const userId = id[0].userId;

        const res = await editProfile(newFirstName, newLastName, newBirthdate, picture, description, experience, userId, language);

        expect(res).toBe(1);

        const dbResult = await getUser(userId);

        expect(dbResult.data.firstName).toEqual(newFirstName);
        expect(dbResult.data.lastName).toEqual(newLastName);

        expect(dbResult.data.birthdate).toEqual(new Date(newBirthdate));

        expect(dbResult.data.picture).toEqual(picture);
        expect(dbResult.data.description).toEqual(description);
        expect(dbResult.data.experience).toEqual(experience);
        expect(dbResult.data.rating).toEqual('0.00000000');
    } finally {
        if (conn) await conn.release();
    }

    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM user WHERE email = ?', [email]);
    } finally {
        if (conn) await conn.release();
    }
});

test('add two languages to profile', async () => {
    const firstName = 'profileTestFirstName';
    const lastName = 'profileTestLastName';
    const email = 'profileTestEmail@test.com';
    const password = 'profileTestPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const description = 'profileTestDescription';
    const experience = 'profileTestExperience';
    const newFirstName = 'profileTestFirstName2';
    const newLastName = 'profileTestLastName2';
    const newBirthdate = '1990-01-02';
    const picture = 'testPicture.jpg';

    const language = [
        {languageId: 1, selected: true},
        {languageId: 2, selected: true},
    ];

    const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

    expect(result).toBe(0);

    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO language(languageName, languagePicture) VALUES  ('Deutsch', 'deutschlandflagge.jpg'), ('Englisch', 'americanflag.jpg')`);
        const id = await conn.query('SELECT userId FROM user WHERE email = ?', [email]);
        const userId = id[0].userId;

        const res = await editProfile(newFirstName, newLastName, newBirthdate, picture, description, experience, userId, language);

        expect(res).toBe(1);

        const dbResult = await getUser(userId);
        expect(dbResult.lang.length).toEqual(2);
        expect(dbResult.lang[0].languageId).toEqual(1);
        expect(dbResult.lang[1].languageId).toEqual(2);
    } finally {
        if (conn) await conn.release();
    }

    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM user WHERE email = ?', [email]);
    } finally {
        if (conn) await conn.release();
    }
});

test('edit language data', async () => {
    const firstName = 'profileTestFirstName';
    const lastName = 'profileTestLastName';
    const email = 'profileTestEmail@test.com';
    const password = 'profileTestPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const description = 'profileTestDescription';
    const experience = 'profileTestExperience';
    const newFirstName = 'profileTestFirstName2';
    const newLastName = 'profileTestLastName2';
    const newBirthdate = '1990-01-02';
    const picture = 'testPicture.jpg';

    const language = [
        {languageId: 1, selected: true},
        {languageId: 2, selected: false},
    ];

    const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

    expect(result).toBe(0);

    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO language(languageId, languageName, languagePicture) VALUES  (10, 'Deutsch', 'deutschlandflagge.jpg'), (20, 'Englisch', 'americanflag.jpg')`);
        const id = await conn.query('SELECT userId FROM user WHERE email = ?', [email]);
        const userId = id[0].userId;

        const res = await editProfile(newFirstName, newLastName, newBirthdate, picture, description, experience, userId, language);

        expect(res).toBe(1);

        const dbResult = await getUser(userId);
        expect(dbResult.lang.length).toEqual(1);
        expect(dbResult.lang[0].languageId).toEqual(1);
    } finally {
        if (conn) await conn.release();
    }

    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM user WHERE email = ?', [email]);
        await conn.query('DELETE FROM language WHERE languageId = 10');
        await conn.query('DELETE FROM language WHERE languageId = 20');
    } finally {
        if (conn) await conn.release();
    }
});

test('get rating data from new registered user', async () => {
    const firstName = 'profileTestFirstName';
    const lastName = 'profileTestLastName';
    const email = 'profileTestEmail@test.com';
    const password = 'profileTestPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const result = await registerNewUser(firstName, lastName, email, password, birthdate, phonenumber);

    expect(result).toBe(0);

    let conn;

    try {
        conn = await pool.getConnection();

        const id = await conn.query('SELECT userId FROM user WHERE email = ?', [email]);
        const userId = id[0].userId;

        const dbResult = await getUserRating(userId);

        expect(dbResult.success).toBeFalsy();
    } finally {
        if (conn) await conn.release();
    }

    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM user WHERE email = ?', [email]);
    } finally {
        if (conn) await conn.release();
    }
});

test('get rating data', async () => {
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience)
        VALUES (12345,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung'),
               (123456,'Vorname', 'Nachname', 'mail@example.com', 'pass123', '1990-05-15', '123456780', 100.0, 'user2.jpg', 'Hi was geht so', 'Viel Erfahrung')`);
        await conn.query(`INSERT INTO ad (adId, description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId, state)
        VALUES (123, 'Beschreibung', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 12345, 'finished')`);
        await conn.query(`INSERT INTO booking (bookingId, adId, userId, price, numSeats, canceled, state)
        VALUES (1234, 123, 123456, 200.0, 4, FALSE, 'confirmed')`);
        await conn.query(`INSERT INTO rating (ratingId, bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment)
        VALUES (1324, 1234, 123456, 12345, 5, 4, 5, NULL, 'Test comment')`);

        const dbResult = await getUserRating(12345);
        expect(dbResult.data[0]).toEqual(
            {
                'ratingId': 1324,
                'bookingId': 1234,
                'userWhoIsEvaluating': 123456,
                'userWhoWasEvaluated': 12345,
                'punctuality': 5,
                'agreement': 4,
                'pleasent': 5,
                'freight': null,
                'comment': 'Test comment',
                'firstName': 'Vorname',
                'lastName': 'Nachname',
                'picture': 'user2.jpg'
            }
        );

    } finally {
        conn.query(`DELETE FROM rating WHERE ratingId = 1324`);
        conn.query(`DELETE FROM booking WHERE bookingId = 1234`);
        conn.query(`DELETE FROM ad WHERE adId = 123`);
        conn.query(`DELETE FROM user WHERE userId = 12345`);
        conn.query(`DELETE FROM user WHERE userId = 123456`);

        if (conn) await conn.release();
    }
});

test('get user experience', async () => {
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO language(languageId, languageName, languagePicture)
        VALUES (10, 'Deutsch', 'deutschlandflagge.jpg'),
               (20, 'Englisch', 'americanflag.jpg')`);
        await conn.query(`INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience)
        VALUES (12345,'Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung'),
               (123456,'Vorname', 'Nachname', 'mail@example.com', 'pass123', '1990-05-15', '123456780', 100.0, 'user2.jpg', 'Hi was geht so', 'Viel Erfahrung'),
               (1234567,'Vorname2', 'Nachname2', 'mail2@example.com', 'pass123', '1990-05-15', '123456780', 100.0, 'user3.jpg', 'Hi was geht so', 'Viel Erfahrung')`);
        await conn.query(`INSERT INTO userLanguage (userLanguageId, userId, languageId)
        VALUES (1234, 12345, 10),
               (12345, 12345, 20)`);
        await conn.query(`INSERT INTO vehicle (vehicleId, name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeatures, userId)
        VALUES (12345, 'Car1', 4, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 12345)`);
        await conn.query(`INSERT INTO ad (adId, description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId, state)
        VALUES (123, 'Beschreibung', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 6, 12345, 'finished'),
               (1234, 'Beschreibung2', 'City C', 'City D', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 3, 123456, 'finished'),
               (12345, 'Beschreibung3', 'City E', 'City F', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 1234567, 'finished')`);
        await conn.query(`INSERT INTO offer (offerId, vehicleId, adId, pricePerPerson, pricePerFreight)
        VALUES (1234, 12345, 123, 50.0, 100.0)`);
        await conn.query(`INSERT INTO wanted (wantedId, adId, freight)
        VALUES (1234, 1234, 'Fragile items'),
               (12345, 12345, 'Fragile items')`);
        await conn.query(`INSERT INTO booking (bookingId, adId, userId, price, numSeats, canceled, state)
        VALUES (1234, 123, 123456, 200.0, 3, FALSE, 'confirmed'),
               (12345, 1234, 12345, 200.0, 3, FALSE, 'confirmed'),
               (123456, 12345, 12345, 200.0, 4, FALSE, 'confirmed'),
               (1234567, 123, 1234567, 200.0, 2, FALSE, 'confirmed')`);

        const dbResult = await getUserXP(12345);
        expect(dbResult.exp).toEqual(350);

    } finally {
        conn.query(`DELETE FROM userLanguage WHERE userLanguageId = 1234`);
        conn.query(`DELETE FROM userLanguage WHERE userLanguageId = 12345`);
        conn.query(`DELETE FROM language WHERE languageId = 10`);
        conn.query(`DELETE FROM language WHERE languageId = 20`);
        conn.query(`DELETE FROM booking WHERE bookingId = 1234`);
        conn.query(`DELETE FROM booking WHERE bookingId = 12345`);
        conn.query(`DELETE FROM booking WHERE bookingId = 123456`);
        conn.query(`DELETE FROM booking WHERE bookingId = 1234567`);
        conn.query(`DELETE FROM wanted WHERE wantedId = 1234`);
        conn.query(`DELETE FROM wanted WHERE wantedId = 12345`);
        conn.query(`DELETE FROM offer WHERE offerId = 1234`);
        conn.query(`DELETE FROM ad WHERE adId = 123`);
        conn.query(`DELETE FROM ad WHERE adId = 1234`);
        conn.query(`DELETE FROM ad WHERE adId = 12345`);
        conn.query(`DELETE FROM vehicle WHERE vehicleId = 12345`);
        conn.query(`DELETE FROM user WHERE userId = 12345`);
        conn.query(`DELETE FROM user WHERE userId = 123456`);
        conn.query(`DELETE FROM user WHERE userId = 1234567`);

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
