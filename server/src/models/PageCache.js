const mongoose = require('mongoose');
const config = require('../config/env');

/**
 * PageCache Model
 * Keyed by slug with a TTL index driven by CACHE_TTL_SECONDS.
 * bufferCommands: false ensures queries fail fast when MongoDB is unavailable.
 */
const pageCacheSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    page: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now, expires: config.cacheTtlSeconds }
  },
  {
    bufferCommands: false
  }
);

module.exports = mongoose.model('PageCache', pageCacheSchema);
