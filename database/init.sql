
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