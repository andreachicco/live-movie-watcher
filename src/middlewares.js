const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if(!token) return res.sendStatus(401);
    
    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.TOKEN_SECRET);

        if(decoded.room_id !== req.params.id) return res.sendStatus(401);
        next();

    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
};

module.exports = {
    verifyToken
}