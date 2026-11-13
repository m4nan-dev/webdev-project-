// middleware/auth.js - creates login tokens (JWT) and protects routes
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'uds-academy-dev-secret-change-me';

function sign(payload) { return jwt.sign(payload, SECRET, { expiresIn: '7d' }); }

// guard('student') or guard('admin') returns a function that blocks everyone else
function guard(role) {
  return (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    try {
      const p = jwt.verify(token, SECRET);
      if (p.role !== role) throw new Error('wrong role');
      req.user = p;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Please log in again' });
    }
  };
}
module.exports = { sign, requireStudent: guard('student'), requireAdmin: guard('admin') };
