
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
    specialFeautures TEXT,
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
     active BOOLEAN DEFAULT TRUE,
     picture VARCHAR(1024),
     userId int not null,
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
    price DOUBLE,
    freight VARCHAR(1024),
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
    CONSTRAINT fk_ad_id_booking
        FOREIGN KEY (adId) REFERENCES ad(adId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_user_id_booking
        FOREIGN KEY (userId) REFERENCES user (userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE OR REPLACE TABLE status(
    statusId int not null PRIMARY KEY auto_increment,
    bookingId int not null,
    bookingConfirmation BOOLEAN DEFAULT FALSE,
    paymentReceived BOOLEAN DEFAULT FALSE,
    startRide BOOLEAN DEFAULT FALSE,
    endRide BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_booking_id_status
   	    FOREIGN KEY (bookingId) REFERENCES booking (bookingId)
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

-- Testdaten für die Tabelle 'language'
INSERT INTO language(languageName, languagePicture)
VALUES  ('Deutsch', 'deutschlandflagge.jpg'),
        ('Englisch', 'americanflag.jpg');

-- Testdaten für die Tabelle 'user'
INSERT INTO user (firstName, lastName, email, password, birthdate, phonenumber, coins, picture, description, experience)
VALUES ('Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100.0, 'user1.jpg', 'Hi was geht so', 'Viel Erfahrung'),
       ('Anna', 'Schmidt', 'anna@example.com', 'pass456', '1995-08-21', '987654321', 75.0, 'user2.jpg', 'Hi was geht so', 'Viel Erfahrung'),
       ('John', 'Doe', 'john@example.com', 'pass789', '1988-12-03', '456789123', 50.0, 'user3.jpg', 'Hi was geht so', 'Viel Erfahrung');

INSERT INTO userLanguage (userId, languageId)
VALUES  (1,1),
        (1,2);

-- Testdaten für die Tabelle 'vehicle'
INSERT INTO vehicle (name, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeautures, userId)
VALUES ('Car1', 4, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 1),
       ('Truck1', 2, 1500.0, 'truck1.jpg', '3x2x2', 'Hydraulic Lift', 2),
       ('Van1', 6, 800.0, 'van1.jpg', '3x3x2', 'Roof Rack', 3);

-- Testdaten für die Tabelle 'ad'

INSERT INTO ad (description, startLocation, endLocation, startDate, endDate, animals, smoker, notes, numSeats, userId)
VALUES ('Ja Beschreibung halt so lololol', 'City A', 'City B', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 1),
       ('Ja Beschreibung halt so lololol', 'Town X', 'Town Y', '2023-02-05', '2023-02-10', 1, 0, 'Smoking allowed', 2, 2),
       ('Ja Beschreibung halt so lololol', 'City C', 'City D', '2024-03-24', '2024-03-25', 0, 0, NULL, 6, 1),
       ('Beschreibung smth', 'Somestandt M', 'Somestadt N', '2098-03-20', '2098-03-25', 0, 0, 'No something allowed', 6, 1),
        ('Beschreibungstext der etwas länger sein sollte blalala lbla lalshlw ashiw siwl w hil wdwi dhwlid hwid hwlidwh dliw dhw', 'Village M', 'Village N', '2023-03-20', '2023-03-25', 0, 0, NULL, 6, 2),
      ('Ja Beschreibung halt so lololol', 'Village M', 'Village N', '2023-03-20', '2023-03-25', 0, 0, NULL, 6, 3);


INSERT INTO intermediateGoal(location, adId)
VALUES ('City C', 1),
       ('City D', 1);

-- Testdaten für die Tabelle 'offer'
INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight)
VALUES (1, 1, 50.0, 100.0),
       (2, 2, 75.0, 150.0),
       (1, 4, 50.0, 100.0),
       (3, 5, 50.0, 100.0);

-- Testdaten für die Tabelle 'wanted'
INSERT INTO wanted (adId, price, freight)
VALUES (3, 50.0, 'Fragile items'),
       (6, 100.0, 'Fragile items 2');

-- Testdaten für die Tabelle 'booking'
INSERT INTO booking (adId, userId, price, numSeats, canceled)
VALUES (1, 2, 200.0, 4, FALSE),
       (2, 3, 150.0, 2, TRUE),
       (3, 1, 240.0, 5, FALSE);

-- Testdaten für die Tabelle 'status'
INSERT INTO status (bookingId, bookingConfirmation, paymentReceived, startRide, endRide)
VALUES (1, TRUE, TRUE, TRUE, FALSE),
       (2, TRUE, FALSE, FALSE, FALSE),
       (3, TRUE, TRUE, TRUE, TRUE);

-- Testdaten für die Tabelle 'rating'
INSERT INTO rating (bookingId, userWhoIsEvaluating, userWhoWasEvaluated, punctuality, agreement, pleasent, freight, comment)
VALUES (1, 2, 1, 5, 4, 5, NULL, 'Great service'),
       (2, 3, 2, 3, 2, 4, 3, 'Could improve communication'),
       (3, 1, 3, 4, 5, 5, NULL, 'Excellent experience');

INSERT INTO message (userId, adId, messageText)
VALUES (2, 2, "Is smoking allowed in your truck ride from Town X to Town Y?"),
       (3, 3, "Hello, I'd like to book a seat in your van for the trip from Village M to Village N."),
       (1, 1, "Sure, there are available seats. Let's discuss the details."),
       (2, 2, "No, smoking is not allowed. Let me know if you have any other questions."),
       (3, 3, "Great! I'll book a seat. Can you provide more information about the van?");