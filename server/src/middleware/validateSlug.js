/**
 * Middleware to validate incoming page slugs.
 * Ensures the slug adheres to safe URL naming conventions.
 * If the slug is invalid or contains traversal characters, returns 404 Not Found.
 */
const validateSlug = (req, res, next) => {
  const { slug } = req.params;

  if (!slug || typeof slug !== 'string') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'The requested page was not found.'
    });
  }

  // Regex: alphanumeric, hyphens, underscores (1-100 characters)
  const slugRegex = /^[a-zA-Z0-9_-]{1,100}$/;

  if (!slugRegex.test(slug) || slug.includes('..')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Page with slug '${slug}' was not found in PagePilot.`
    });
  }

  next();
};

module.exports = validateSlug;
