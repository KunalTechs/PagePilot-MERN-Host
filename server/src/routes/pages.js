const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const config = require('../config/env');
const pagepilotService = require('../services/pagepilot');
const PageCache = require('../models/PageCache');

const safeEqual = (a = '', b = '') => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

/**
 * GET /api/pages/:slug
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const slug = rawSlug.trim();

    // Slug validation: /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/ and max 100 chars
    const slugRegex = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
    if (slug.length > 100 || !slugRegex.test(slug)) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const isPreviewRequested = req.query.mode === 'preview';

    if (isPreviewRequested) {
      const token = req.get('x-preview-token');
      if (!token || !safeEqual(token, config.previewSecret)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.set('Cache-Control', 'no-store');

      try {
        const page = await pagepilotService.fetchPage(slug, { preview: true });
        if (!page) {
          return res.status(404).json({ error: 'Page not found' });
        }
        return res.json({ page });
      } catch (err) {
        return res.status(502).json({ error: 'Content service unavailable' });
      }
    }

    // Normal mode: check cache first
    try {
      const cached = await PageCache.findOne({ slug }).lean();
      if (cached && cached.page) {
        if (cached.page.status && cached.page.status.toLowerCase() === 'draft') {
          await PageCache.deleteOne({ slug }).catch(() => {});
        } else {
          return res.json({ page: cached.page });
        }
      }
    } catch (cacheErr) {
      // Ignore DB cache errors when offline
    }

    // Cache miss: fetch live page
    let page = null;
    try {
      page = await pagepilotService.fetchPage(slug, { preview: false });
    } catch (err) {
      return res.status(502).json({ error: 'Content service unavailable' });
    }

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Store in cache
    try {
      await PageCache.findOneAndUpdate(
        { slug },
        { slug, page, createdAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (cacheWriteErr) {
      // Ignore DB write errors when offline
    }

    return res.json({ page });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
