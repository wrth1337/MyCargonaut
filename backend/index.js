const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = require('http').createServer(app);

const user = require('./routes/user');
app.use('/user', user.router);

const coins = require('./routes/coins');
app.use('/coins', coins.router);

const profile = require('./routes/profile');
app.use('/profile', profile.router);

const vehicle = require('./routes/vehicle');
app.use('', vehicle.router);

const offer = require('./routes/offer');
app.use('/offer', offer.router);

const wanted = require('./routes/wanted');
app.use('/wanted', wanted.router);

const ad = require('./routes/ad');
app.use('/ad', ad.router);

const trip = require('./routes/trip');
app.use('/trip', trip.router);

const searchbar = require('./routes/searchbar');
app.use('/searchbar', searchbar.router);
const rating = require('./routes/rating');
app.use('/rating', rating.router);

const chat = require('./routes/chat');
app.use('/chat', chat.router);

const booking = require('./routes/booking');
app.use('/booking', booking.router);

// app.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Express API for JSONPlaceholder',
        version: '1.0.0',
    },
};

const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
httpServer.listen(port, () => console.log(`listening on port ${port}`));
