import jwt from 'jsonwebtoken';
import { User } from '../data/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'awt-secret-key';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed.' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    User.findById(payload.userId).then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid token.' });
      }
      req.user = { id: user._id, name: user.name, email: user.email };
      next();
    }).catch(() => {
      console.error('User lookup error');
      return res.status(401).json({ error: 'Invalid or expired token.' });
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const authenticateToken = authMiddleware;
