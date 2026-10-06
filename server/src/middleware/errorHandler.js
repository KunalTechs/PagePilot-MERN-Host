const config = require('../config/env');

/**
 * Global Error Handling Middleware.
 * Prevents leaks of internal implementation details, stack traces, or upstream keys.
 */
const errorHandler = (err, req, res, next) => {
  // Log full error details for server diagnostics
  console.error('[SERVER ERROR]', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  // Handle Axios / Upstream PagePilot Errors
  if (err.isAxiosError) {
    const statusCode = err.response ? err.response.status : 502;
    if (statusCode === 404) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'The requested page does not exist in PagePilot.'
      });
    }
    return res.status(statusCode).json({
      error: 'Upstream Error',
      message: 'Failed to fetch content from PagePilot service.'
    });
  }

  // Generic 500 Internal Server Error fallback
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred.'
  });
};

module.exports = errorHandler;
