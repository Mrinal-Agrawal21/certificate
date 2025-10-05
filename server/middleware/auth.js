const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    // Validate session version to invalidate old tokens
    const user = await AdminUser.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ message: 'Invalid token user' });
    if (typeof decoded.sv === 'number') {
      if ((user.sessionVersion || 0) !== decoded.sv) {
        return res.status(401).json({ message: 'Session expired. Please login again.' });
      }
    }
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
