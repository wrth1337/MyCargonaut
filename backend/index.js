const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = require('http').createServer(app);

const user = require('./routes/user');
app.use('/user', user.router);

httpServer.listen(port, () => console.log(`listening on port ${port}`));
