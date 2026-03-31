const jwt = require('jsonwebtoken');
const { rtdb } = require('../config/firebase');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Realtime DB
    const userRef = rtdb.ref(`users/${decoded._id}`);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
      throw new Error();
    }

    req.user = { _id: snapshot.key, ...snapshot.val() };
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send({ error: 'Access denied. Admin role required.' });
  }
};

module.exports = { auth, isAdmin };
