const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'TEST_DEV_SECRET';

function authenticateToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({message: 'Unauthorized'});
    }
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, jwtSecret, function(err, decoded) {
        if (err) return res.status(401).send({message: 'Unauthorized'});
        req.user_id = decoded.user_id;
        req.email = decoded.email;
        next();
    });
}

module.exports = authenticateToken;
