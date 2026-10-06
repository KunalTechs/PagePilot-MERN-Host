const axios = require('axios');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const config = require('../config/env');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Configure DOMPurify options for server-side HTML sanitization.
 * Enforces strict tag & attribute allow-lists while forbidding executable tags/scripts.
 */
const SANITIZE_OPTIONS = {
  FORCE_BODY: true,
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'base'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'autofocus'],
  ADD_TAGS: ['style', 'link', 'picture'],
  ADD_ATTR: ['target', 'rel', 'data-action', 'data-block', 'data-layout', 'data-ahd-tpl-root', 'role', 'aria-label', 'aria-hidden', 'aria-controls'],
};

function sanitizeHtml(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') return '';
  return DOMPurify.sanitize(htmlContent, SANITIZE_OPTIONS);
}

/**
 * Fetch page content from PagePilot server-side.
 * SSRF Protection: Target URL is strictly constructed using fixed config.pagePilotApi
 * base URL and an alphanumeric validated slug parameter.
 * 
 * @param {string} slug - Validated page slug
 * @param {Object} options - Options object
 * @param {boolean} options.preview - Whether to fetch draft preview
 * @returns {Promise<Object|null>} Normalized page object or null
 */
async function fetchPage(slug, { preview = false } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // Strict validation check to ensure slug cannot alter domain or protocol
    const slugRegex = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
    if (!slug || slug.length > 100 || !slugRegex.test(slug)) {
      return null;
    }

    const headerMenuName = config.headerMenuName || process.env.PAGEPILOT_HEADER_MENU || 'main-header';

    const fullIncludes = [
      {
        key: 'headerMenu',
        entity: 'menu-by-name',
        filter: { name: headerMenuName }
      },
      {
        key: 'faqs',
        entity: 'faq-group-list',
        filter: { slug, status: 'published', orderBy: 'order_ASC' }
      }
    ];

    const url = `${config.pagePilotApi}/pagebyslug/${encodeURIComponent(slug)}`;
    let responseData = null;

    try {
      const response = await axios.post(
        url,
        {
          data: {
            includes: fullIncludes,
            pageSelect: {
              select: { name: 1, title: 1, slug: 1, metaTitle: 1, metaDescription: 1, metaImageUrl: 1, updatedAt: 1, status: 1 },
              sectionSelect: { content: 1 }
            }
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          timeout: 15000
        }
      );
      responseData = response.data;
    } catch (primaryErr) {
      // If full includes fails (e.g. menu-by-name missing or erroring), try fallback without headerMenu
      try {
        const fallbackIncludes = [
          {
            key: 'faqs',
            entity: 'faq-group-list',
            filter: { slug, status: 'published', orderBy: 'order_ASC' }
          }
        ];

        const fallbackRes = await axios.post(
          url,
          {
            data: {
              includes: fallbackIncludes,
              pageSelect: {
                select: { name: 1, title: 1, slug: 1, metaTitle: 1, metaDescription: 1, metaImageUrl: 1, updatedAt: 1, status: 1 },
                sectionSelect: { content: 1 }
              }
            }
          },
          {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            timeout: 15000
          }
        );
        responseData = { ...fallbackRes.data, headerMenu: null };
      } catch (fallbackErr) {
        if (fallbackErr.response && fallbackErr.response.status === 404) {
          // Page itself does not exist on PagePilot
          return null;
        }
        throw fallbackErr;
      }
    }

    if (!responseData) return null;

    const rawPage = responseData.page || responseData;
    if (!rawPage || (!rawPage.name && !rawPage.title && !rawPage.sections && !rawPage.content)) {
      return null;
    }

    // In Live Mode (preview === false), hide draft pages from public visitors
    if (!preview && rawPage.status && rawPage.status.toLowerCase() === 'draft') {
      return null;
    }

    // Join sections' content in order
    const sections = Array.isArray(rawPage.sections) ? rawPage.sections : [];
    const joinedHtml = sections
      .map(sec => sec.content || '')
      .filter(Boolean)
      .join('\n');

    const htmlToSanitize = joinedHtml || rawPage.content || '';

    const headerMenu = responseData.headerMenu || null;
    const rawFaqs = Array.isArray(responseData.faqs) ? responseData.faqs : [];
    const faqs = rawFaqs.map((item, idx) => {
      const inner = item.faqs || item;
      const question = (inner.question || item.title || `Question ${idx + 1}`).trim();
      let answerHtml = '';
      if (typeof inner.answer === 'string') {
        answerHtml = inner.answer;
      } else if (typeof inner.content === 'string') {
        answerHtml = inner.content;
      } else if (Array.isArray(inner.content) && inner.content.length > 0) {
        answerHtml = inner.content.map(c => (typeof c === 'string' ? c : c.content || '')).filter(Boolean).join('\n');
      } else if (Array.isArray(item.items) && item.items.length > 0) {
        answerHtml = item.items.map(i => i.answer || i.content || '').filter(Boolean).join('\n');
      }
      return {
        _id: item._id || item.id || `faq-${idx}`,
        question,
        answer: sanitizeHtml(answerHtml)
      };
    }).filter(f => f.question || f.answer);

    // Normalize result (do NOT forward head or bodyBottom custom scripts)
    const normalizedPage = {
      title: rawPage.title || rawPage.name || '',
      metaTitle: rawPage.metaTitle || rawPage.name || '',
      metaDescription: rawPage.metaDescription || '',
      metaImageUrl: rawPage.metaImageUrl || null,
      status: rawPage.status || 'live',
      html: sanitizeHtml(htmlToSanitize),
      updatedAt: rawPage.updatedAt || new Date().toISOString(),
      sections: sections.map(s => ({ ...s, content: sanitizeHtml(s.content || '') })),
      headerMenu,
      faqs
    };

    return normalizedPage;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // Page not found
    }
    if (axios.isCancel && axios.isCancel(error)) {
      const err = new Error('PagePilot request timed out');
      err.status = 504;
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  fetchPage,
  sanitizeHtml
};
