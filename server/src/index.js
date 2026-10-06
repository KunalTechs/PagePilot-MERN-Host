const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const connectDB = require('./db/connection');
const pagesRouter = require('./routes/pages');

const app = express();

// 1. Connect MongoDB gracefully
connectDB();

// 2. Helmet Security Headers & Content Security Policy (CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Required for PagePilot inline <style> tags inside Shadow DOM
          'https://fonts.googleapis.com',
          'https://use.fontawesome.com',
          'https://cdn.jsdelivr.net'
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://use.fontawesome.com',
          'https://cdn.jsdelivr.net'
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https://storage-for-tutors.ams3.cdn.digitaloceanspaces.com',
          'https://ui-avatars.com',
          'https://pagepilot.fabbuilder.com'
        ],
        connectSrc: ["'self'", 'https://pagepilot.fabbuilder.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 3. CORS restricted to CLIENT_ORIGIN only
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const corsErr = new Error('CORS policy: Origin not allowed.');
      corsErr.status = 403;
      return callback(corsErr);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-preview-token']
  })
);

// 4. Request Body Parsing (Limit 10kb)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Rate Limit on /api (60 req/min per IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api', apiLimiter);

// 6. Mount /api/pages
app.use('/api/pages', pagesRouter);

// 7. Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv
  });
});

// 8. 404 Handler for Unknown API Routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

// 9. Centralized Error Handler (Logs server-side, returns clean JSON)
app.use((err, req, res, next) => {
  if (err.message === 'CORS policy: Origin not allowed.') {
    return res.status(403).json({ error: 'CORS policy: Origin not allowed' });
  }
  console.error('[SERVER ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({ error: 'Something went wrong' });
});

// Start Server if called directly
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`[Server] Express running on port ${config.port}`);
  });
}

module.exports = app;
