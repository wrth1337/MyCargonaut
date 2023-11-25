const app = require('express')();
const httpServer = require('http').createServer(app);


const port = process.env.PORT || 3000;


httpServer.listen(port, () => console.log(`listening on port ${port}`));
