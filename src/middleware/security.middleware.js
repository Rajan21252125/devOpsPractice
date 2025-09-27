import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message =
          'Admin request limit reached (20 requests per minute). Slow down!';
        break;
      case 'user':
        limit = 10;
        message =
          'User request limit reached (10 requests per minute). Please wait a moment.';
        break;
      case 'guest':
        limit = 5;
        // eslint-disable-next-line no-unused-vars
        message =
          'Guest request limit reached (5 requests per minute). Consider signing up for more access.';
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot detected and blocked', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access request are not allowed',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Sheild blocked request', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request block by security policy',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceed', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
      });
      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Too many request' });
    }

    next();
  } catch (error) {
    console.error('Security middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong with the security middleware',
    });
  }
};
