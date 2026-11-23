const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'nst-learning-hub-jwt-secret-key-college-project';

// Middleware to verify JWT authentication token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        department: true,
        year: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

// Optional auth middleware (attaches user if token is present, does not reject if not)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        department: true,
        year: true,
      },
    });
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }

  next();
}

// Middleware to enforce REVIEWER role
function requireReviewer(req, res, next) {
  if (!req.user || req.user.role !== 'REVIEWER') {
    return res.status(403).json({ error: 'Access denied. Reviewer role required.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireReviewer,
  JWT_SECRET,
};
