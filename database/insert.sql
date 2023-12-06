-- Testdaten für die Tabelle 'user'
INSERT INTO user (firstName, lastName, email, passwords, birthdate, phonenumber, coins, picture)
VALUES ('Max', 'Mustermann', 'max@example.com', 'pass123', '1990-05-15', '123456789', 100, 'user1.jpg'),
       ('Anna', 'Schmidt', 'anna@example.com', 'pass456', '1995-08-21', '987654321', 75, 'user2.jpg'),
       ('John', 'Doe', 'john@example.com', 'pass789', '1988-12-03', '456789123', 50, 'user3.jpg');

-- Testdaten für die Tabelle 'vehicle'
INSERT INTO vehicle (nameV, numSeats, maxWeight, picture, loadingAreaDimensions, specialFeautures, userId)
VALUES ('Car1', 4, 500.0, 'car1.jpg', '2x2x2', 'GPS, Bluetooth', 1),
       ('Truck1', 2, 1500.0, 'truck1.jpg', '3x2x2', 'Hydraulic Lift', 2),
       ('Van1', 6, 800.0, 'van1.jpg', '3x3x2', 'Roof Rack', 3);

-- Testdaten für die Tabelle 'ad'
INSERT INTO ad (startLocation, endLocation, intermediateGoals, startDate, endDate, animals, smoker, notes, numSeats, userId)
VALUES ('City A', 'City B', 'City C, City D', '2023-01-10', '2023-01-15', 0, 1, 'No pets allowed', 4, 1),
       ('Town X', 'Town Y', NULL, '2023-02-05', '2023-02-10', 1, 0, 'Smoking allowed', 2, 2),
       ('Village M', 'Village N', 'Village O', '2023-03-20', '2023-03-25', 0, 0, NULL, 6, 3);

-- Testdaten für die Tabelle 'offer'
INSERT INTO offer (vehicleId, adId, pricePerPerson, pricePerFreight)
VALUES (1, 1, 50.0, 100.0),
       (2, 2, 75.0, 150.0),
       (3, 3, 40.0, 80.0);

-- Testdaten für die Tabelle 'wanted'
INSERT INTO wanted (adId, freight)
VALUES (1, 'Fragile items'),
       (2, 'Documents'),
       (3, 'General goods');

-- Testdaten für die Tabelle 'booking'
INSERT INTO booking (adId, userId, price, timeBooking, numSeats, canceled)
VALUES (1, 2, 200.0, NOW(), 4, FALSE),
       (2, 3, 150.0, NOW(), 2, TRUE),
       (3, 1, 240.0, NOW(), 5, FALSE);

-- Testdaten für die Tabelle 'status'
INSERT INTO status (bookingId, bookingConfirmation, paymentReceived, startRide, endRide)
VALUES (1, TRUE, TRUE, TRUE, FALSE),
       (2, TRUE, FALSE, FALSE, FALSE),
       (3, TRUE, TRUE, FALSE, TRUE);

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

