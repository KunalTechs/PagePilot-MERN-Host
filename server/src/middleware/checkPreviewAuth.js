const crypto = require('crypto');
const config = require('../config/env');

/**
 * Timing-safe string comparison to prevent timing side-channel attacks.
 */
const safeEqual = (a = '', b = '') => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

/**
 * Security Middleware: Draft & Preview Protection.
 * PagePilot allows passing `?mode=preview` to fetch unpublished drafts.
 * Because drafts expose unreleased content:
 * 1. Requests specifying `mode=preview` MUST provide authorization via `x-preview-token` header.
 * 2. Tokens in query strings are explicitly rejected to prevent leaks in logs and Referer headers.
 * 3. Uses constant-time comparison to prevent timing attacks.
 * 4. Sets Cache-Control: no-store on preview responses.
 */
const checkPreviewAuth = (req, res, next) => {
  const isPreviewMode = req.query.mode === 'preview';

  if (isPreviewMode) {
    const token = req.get('x-preview-token');

    if (!token || !safeEqual(token, config.previewSecret)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Accessing draft content in preview mode requires a valid x-preview-token header.'
      });
    }

    // Ensure draft responses are never stored in browser or proxy caches
    res.set('Cache-Control', 'no-store');
  }

  next();
};

module.exports = checkPreviewAuth;
