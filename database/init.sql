CREATE TABLE users (
    userID serial PRIMARY KEY,
    name VARCHAR(50),
    password VARCHAR(100),
    email VARCHAR(100)
);