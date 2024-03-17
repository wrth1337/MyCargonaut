
CREATE OR REPLACE TABLE language (
    languageId int not null PRIMARY KEY auto_increment,
    languageName VARCHAR(255),
    languagePicture VARCHAR(1024)
);

CREATE OR REPLACE TABLE user (
    userId int not null PRIMARY KEY auto_increment,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    phonenumber VARCHAR(100),
    coins DOUBLE,
    picture VARCHAR(1024),
    description TEXT,
    experience TEXT
);

CREATE OR REPLACE TABLE userLanguage (
    userLanguageId int not null PRIMARY KEY auto_increment,
    userId int not null,
    languageId int not null,
    CONSTRAINT fk_userLanguage_userId
   	FOREIGN KEY (userId) REFERENCES user (userId)
   	ON DELETE CASCADE
   	ON UPDATE CASCADE,
    CONSTRAINT fk_userLanguage_languageId
   	FOREIGN KEY (languageId) REFERENCES language (languageId)
   	ON DELETE CASCADE
   	ON UPDATE CASCADE
);

CREATE OR REPLACE TABLE vehicle (
    vehicleId int not null PRIMARY KEY auto_increment,
    name VARCHAR(100) NOT NULL,
    numSeats SMALLINT NOT NULL,
    maxWeight FLOAT,
    picture VARCHAR(1024),
    loadingAreaDimensions VARCHAR(100),
    specialFeatures TEXT,
    userId int not null,
    CONSTRAINT fk_user_id
   	FOREIGN KEY (userId) REFERENCES user (userId)
   	ON DELETE CASCADE
   	ON UPDATE CASCADE
);

CREATE OR REPLACE TABLE ad (
     adId int not null PRIMARY KEY auto_increment,
     description TEXT,
     startLocation VARCHAR(255),
     endLocation VARCHAR(255),
     startDate DATE,
     endDate DATE,
     animals BOOLEAN,
     smoker BOOLEAN,
     notes TEXT,
     numSeats SMALLINT,
     picture VARCHAR(1024),
     userId int not null,
     state ENUM('created', 'started', 'finished') DEFAULT 'created',
     CONSTRAINT fk_user_id2
   	FOREIGN KEY (userId) REFERENCES user (userId)
    ON DELETE CASCADE
   	ON UPDATE CASCADE
);

CREATE OR REPLACE TABLE intermediateGoal(
    intermediateGoalId int not null PRIMARY KEY auto_increment,
    location VARCHAR(255) not null,
    adId int not null,
    CONSTRAINT fk_ad_id_intermediateGoal
        FOREIGN KEY (adId) REFERENCES ad (adId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE OR REPLACE TABLE offer(
    offerId int not null PRIMARY KEY auto_increment,
    vehicleId int not null,
    adId int not null,
    pricePerPerson DOUBLE,
    pricePerFreight DOUBLE,
    CONSTRAINT fk_vehicle_id_offer
   	FOREIGN KEY (vehicleId) REFERENCES vehicle (vehicleId)
	ON UPDATE CASCADE,
    CONSTRAINT fk_ad_id_offer
   	FOREIGN KEY (adId) REFERENCES ad(adId)
   	ON DELETE CASCADE
   	ON UPDATE CASCADE
);

CREATE OR REPLACE TABLE wanted(
    wantedId int not null PRIMARY KEY auto_increment,
    adId int not null,
    freight VARCHAR(1024),
    price DOUBLE not null,
    CONSTRAINT fk_ad_id_wanted
   	FOREIGN KEY (adId) REFERENCES ad(adId)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE OR REPLACE TABLE booking(
    bookingId int not null PRIMARY KEY auto_increment,
    adId int not null,
    userId int not null,
    price DOUBLE NOT NULL,
    timeBooking TIMESTAMP DEFAULT NOW(),
    numSeats SMALLINT NOT NULL,
    canceled BOOLEAN DEFAULT FALSE,
    state ENUM('pending', 'confirmed', 'denied') DEFAULT 'pending',
    CONSTRAINT fk_ad_id_booking
        FOREIGN KEY (adId) REFERENCES ad(adId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_user_id_booking
        FOREIGN KEY (userId) REFERENCES user (userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE OR REPLACE TABLE rating(
    ratingId int not null PRIMARY KEY auto_increment,
    bookingId int not null,
    userWhoIsEvaluating int not null,
    userWhoWasEvaluated int not null,
    punctuality SMALLINT UNSIGNED NOT NULL,
    agreement SMALLINT UNSIGNED NOT NULL,
    pleasent SMALLINT UNSIGNED NOT NULL,
    freight SMALLINT UNSIGNED,
    comment TEXT,
    CONSTRAINT fk_booking_id_rating
   	FOREIGN KEY (bookingId) REFERENCES booking (bookingId)
   	ON DELETE CASCADE
   	ON UPDATE CASCADE,
    CONSTRAINT fk_user_id_userWhoIsEvaluating
   	FOREIGN KEY (userWhoIsEvaluating) REFERENCES user (userId)
   	ON DELETE CASCADE
   	ON UPDATE CASCADE,
    CONSTRAINT fk_user_id_userWhoWasEvaluated
   	FOREIGN KEY (userWhoWasEvaluated) REFERENCES user (userId)
   	ON DELETE CASCADE
   	ON UPDATE CASCADE
);

CREATE OR REPLACE TABLE message(
    messageId int not null PRIMARY KEY auto_increment,
    userId int not null,
    adId int not null,
    timeMessage TIMESTAMP DEFAULT NOW(),
    messageText text not null,
    CONSTRAINT fk_user_id_message
    	FOREIGN KEY (userId) REFERENCES user (userId)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE,
    CONSTRAINT fk_ad_id_message
    	FOREIGN KEY (adId) REFERENCES ad (adId)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE
);


/***/
INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) VALUES (1, 'Benjamin', 'Wirth', 'benjamin@thm.de', '$argon2id$v=19$m=65536,t=3,p=4$xHqbYJ6Qj5X9OZ12yHHcWA$vO2txwvGaoxC3/RgoLAaqUT2L8C1KlzIpw5kQzfMNc0', '1999-01-01', '7481256487122468', 500, null, null, null);
INSERT INTO user (userId, firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience) VALUES (2, 'Nico', 'Binder', 'nico@thm.de', '$argon2id$v=19$m=65536,t=3,p=4$a1yvZJQvrvbNiA0M3+oKXA$hZGWES6y4bsqRsDmmsNta8XFzGLHnKuY7kdONI5hkFE', '2002-01-01', '71623481641', 1080, null, null, null);

INSERT INTO vehicle (vehicleId, name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeatures, userId) VALUES (1, 'Merzedes', 5, 600, null, '150x190x80', 'Kann auch längere Gegenstände transportieren, es handelt sich um einen Kombi', 1);

INSERT INTO language(languageName, languagePicture)
VALUES  ('Deutsch', 'deutschlandflagge.jpg'),
        ('Englisch', 'americanflag.jpg');

INSERT INTO ad (adId, description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, picture, userId, state) VALUES (1, 'Ich fahre zu meinem Bruder und kann noch 4 weitere Personen mitnehmen.
Bitte beachtet, dass ich pünktlich um 09:00 Uhr losfahren muss.', 'Haiger', 'Dortmund', '2024-03-19', '2024-03-19', 0, 1, null, 4, null, 1, 'finished');
INSERT INTO ad (adId, description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, picture, userId, state) VALUES (2, 'Hallo,
leider ist mir mein Fahrzeug in Dortmund gestohlen worden. Kann mich jemand  mit nach Haiger nehmen? ', 'Dortmund', 'Haiger', '2024-03-22', '2024-03-22', 0, 0, null, 1, null, 1, 'finished');

INSERT INTO offer (offerId, vehicleId, adId, pricePerPerson, pricePerFreight) VALUES (1, 1, 1, 90, 2);

INSERT INTO wanted (wantedId, adId, freight, price) VALUES (1, 2, '5', 200);

INSERT INTO booking (bookingId, adId, userId, price, timeBooking, numSeats, canceled, state) VALUES (1, 1, 2, 90, '2024-03-17 11:55:16', 1, 0, 'confirmed');
INSERT INTO booking (bookingId, adId, userId, price, timeBooking, numSeats, canceled, state) VALUES (2, 2, 2, 200, '2024-03-17 12:00:42', 1, 0, 'confirmed');

INSERT INTO rating (ratingId, bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) VALUES (4, 2, 2, 1, 5, 5, 5, null, 'Alles bestens funktioniert');
INSERT INTO rating (ratingId, bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) VALUES (1, 1, 2, 1, 5, 5, 5, 5, 'Alles bestens gelaufen, Benjamin hat mich pünktlich bei mir zuhause eingesammelt. Gerne wieder! ');
INSERT INTO rating (ratingId, bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) VALUES (2, 1, 1, 2, 5, 5, 5, null, 'Alles bestens, fahrt hat super funktioniert. Mitfahrer war pünktlich');
INSERT INTO rating (ratingId, bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment) VALUES (3, 2, 1, 2, 5, 5, 5, 5, 'Nico ist super gefahren, ich bin gut zuhause angekommen!');

INSERT INTO message (messageId, userId, adId, timeMessage, messageText) VALUES (1, 2, 1, '2024-03-17 11:54:02', 'Hallo Benjamin, kannst du mich auch vorher einsammeln? ');
INSERT INTO message (messageId, userId, adId, timeMessage, messageText) VALUES (2, 1, 1, '2024-03-17 11:54:24', 'Klar kein Problem, wo wohnst du denn?');
INSERT INTO message (messageId, userId, adId, timeMessage, messageText) VALUES (3, 2, 1, '2024-03-17 11:54:51', 'In der Seitenbach Straße in Haiger. Das müssten 5 Minuten von dir aus sein.');
INSERT INTO message (messageId, userId, adId, timeMessage, messageText) VALUES (4, 1, 1, '2024-03-17 11:55:13', 'Top, dann wäre ich um 08:50 bei dir ');
INSERT INTO message (messageId, userId, adId, timeMessage, messageText) VALUES (5, 2, 2, '2024-03-17 11:59:54', 'Hallo Benjamin, wollen wir uns einen Mietwagen teilen? Ich würde dich dann einsammeln und wir fahren gemeinsam zurück?');
INSERT INTO message (messageId, userId, adId, timeMessage, messageText) VALUES (6, 1, 2, '2024-03-17 12:00:27', 'Hallo Nico, das wäre super wenn wir das so machen könnten. Viele Grüße Benjamin');
