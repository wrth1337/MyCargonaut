const app = require('express')();
const httpServer = require('http').createServer(app);
const cors = require('cors');

const port = process.env.PORT || 3000;

app.use(cors());

const user = require('./routes/user');
app.use('/user', user.router);

httpServer.listen(port, () => console.log(`listening on port ${port}`));
