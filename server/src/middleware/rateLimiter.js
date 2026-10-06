const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware.
 * Protects PagePilot proxy endpoints from brute force, scrapers, and DoS.
 * Allows 100 requests per 15-minute window per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the request limit. Please try again later.'
  }
});

module.exports = apiLimiter;
