const {expect, test, afterAll} = require('@jest/globals');
const {registerNewUser} = require('../routes/user');
const {getUser, editProfile} = require('../routes/profile');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: '0.0.0.0',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'cargodb',
});

test('get profile data from new registered user', async () => {
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
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
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const description = 'testDescription';
    const experience = 'testExperience';
    const newFirstName = 'testFirstName2';
    const newLastName = 'testLastName2';
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
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const description = 'testDescription';
    const experience = 'testExperience';
    const newFirstName = 'testFirstName2';
    const newLastName = 'testLastName2';
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
    const firstName = 'testFirstName';
    const lastName = 'testLastName';
    const email = 'testEmail@test.com';
    const password = 'testPassword';
    const birthdate = '1990-01-01';
    const phonenumber = '1234567890';

    const description = 'testDescription';
    const experience = 'testExperience';
    const newFirstName = 'testFirstName2';
    const newLastName = 'testLastName2';
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
        await conn.query(`INSERT INTO language(languageName, languagePicture) VALUES  ('Deutsch', 'deutschlandflagge.jpg'), ('Englisch', 'americanflag.jpg')`);
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
    } finally {
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
