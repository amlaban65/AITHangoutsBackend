const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(401).json({ message: 'Auth error: No bearer token provided' });
  
    const bearerToken = bearerHeader.split(' ')[1];
    if (!bearerToken) return res.status(401).json({ message: 'Auth error: Invalid bearer token format' });
  
    try {
      const decoded = jwt.verify(bearerToken, process.env.secret);
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Auth error: Invalid bearer token' });
    }
  }


module.exports = verifyToken;