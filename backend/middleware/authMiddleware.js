const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Validates JWT from 'Authorization: Bearer <token>' header
 * Sets req.user = decoded payload upon successful verification
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check if Authorization header is present
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Access denied. No authorization header provided.',
    });
  }

  // 2. Validate Bearer scheme format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Malformed authorization header. Expected format: Bearer <token>',
    });
  }

  const token = parts[1];

  // 3. Verify JWT token with error handling
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('⚠️ CRITICAL: JWT_SECRET is not defined in environment variables!');
      return res.status(500).json({
        success: false,
        error: 'Configuration Error',
        message: 'Server authentication configuration is missing.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id: user._id, email: user.email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TokenExpired',
        message: 'Session has expired. Please log in again.',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'InvalidToken',
        message: 'Authentication token is invalid or tampered with.',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token verification failed: ' + err.message,
    });
  }
};

module.exports = authMiddleware;
