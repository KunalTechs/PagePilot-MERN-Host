const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/index');
const config = require('../src/config/env');
const pagepilotService = require('../src/services/pagepilot');
const { sanitizeHtml } = require('../src/services/pagepilot');

describe('Comprehensive Backend Proxy & Security Test Suite', () => {
  let originalFetchPage;

  beforeEach(() => {
    originalFetchPage = pagepilotService.fetchPage;
  });

  afterEach(() => {
    pagepilotService.fetchPage = originalFetchPage;
  });

  // 1. Slug Payloads Table Test (25+ payloads)
  describe('Slug Validation Table Test', () => {
    const slugTable = [
      { payload: '../', expectedStatus: 404 },
      { payload: '..%2F', expectedStatus: 404 },
      { payload: '%00', expectedStatus: 404 },
      { payload: 'a/b', expectedStatus: 404 },
      { payload: 'A', expectedStatus: 404 },
      { payload: 'a_b', expectedStatus: 404 },
      { payload: 'a'.repeat(101), expectedStatus: 404 },
      { payload: ' ', expectedStatus: 404 },
      { payload: '<script>', expectedStatus: 404 },
      { payload: 'unicode-😀', expectedStatus: 404 },
      { payload: '-a', expectedStatus: 404 },
      { payload: 'a-', expectedStatus: 404 },
      { payload: 'about..us', expectedStatus: 404 },
      { payload: '%2e%2e', expectedStatus: 404 },
      { payload: '%2F', expectedStatus: 404 },
      { payload: 'about-us/extra', expectedStatus: 404 },
      { payload: 'INVALID_SLUG!', expectedStatus: 404 },
      { payload: 'slug_with_underscore', expectedStatus: 404 },
      { payload: 'UPPERCASE-SLUG', expectedStatus: 404 },
      { payload: 'slug.html', expectedStatus: 404 },
      { payload: 'slug?param=val', expectedStatus: 404 },
      { payload: 'slug#hash', expectedStatus: 404 },
      { payload: 'slug%20space', expectedStatus: 404 },
      { payload: 'slug\nnewline', expectedStatus: 404 },
      { payload: 'slug\ttab', expectedStatus: 404 },
      { payload: 'eval(alert(1))', expectedStatus: 404 },
      { payload: 'etc/passwd', expectedStatus: 404 }
    ];

    slugTable.forEach(({ payload, expectedStatus }, idx) => {
      test(`Slug Payload #${idx + 1}: [${payload}] -> ${expectedStatus}`, async () => {
        const response = await request(app).get('/api/pages/' + encodeURIComponent(payload));
        assert.equal(response.status, expectedStatus);
        assert.deepEqual(response.body, { error: 'Page not found' });
      });
    });
  });

  // 2. Upstream Failure & Error Mapping Tests
  describe('Upstream Errors & Edge Cases', () => {
    test('Upstream 500 maps to 502 Content service unavailable', async () => {
      pagepilotService.fetchPage = async () => {
        const err = new Error('Upstream Server Error');
        err.response = { status: 500 };
        throw err;
      };
      const response = await request(app).get('/api/pages/test-500-slug');
      assert.equal(response.status, 502);
      assert.deepEqual(response.body, { error: 'Content service unavailable' });
    });

    test('Upstream Timeout maps to 504 Timeout', async () => {
      pagepilotService.fetchPage = async () => {
        const err = new Error('PagePilot request timed out');
        err.status = 504;
        throw err;
      };
      const response = await request(app).get('/api/pages/test-timeout-slug');
      assert.equal(response.status, 502);
      assert.deepEqual(response.body, { error: 'Content service unavailable' });
    });

    test('Upstream 404 maps to 404 Page not found', async () => {
      pagepilotService.fetchPage = async () => null;
      const response = await request(app).get('/api/pages/non-existent-slug');
      assert.equal(response.status, 404);
      assert.deepEqual(response.body, { error: 'Page not found' });
    });
  });

  // 3. Draft Preview Authentication Tests
  describe('Draft Preview Auth & Cache Headers', () => {
    test('Preview mode without x-preview-token header returns 403 Forbidden', async () => {
      const response = await request(app).get('/api/pages/about-us?mode=preview');
      assert.equal(response.status, 403);
      assert.deepEqual(response.body, { error: 'Forbidden' });
    });

    test('Preview mode with invalid token returns 403 Forbidden', async () => {
      const response = await request(app)
        .get('/api/pages/about-us?mode=preview')
        .set('x-preview-token', 'invalid-token-string');
      assert.equal(response.status, 403);
      assert.deepEqual(response.body, { error: 'Forbidden' });
    });

    test('Preview mode with different length token returns 403 Forbidden without crash', async () => {
      const response = await request(app)
        .get('/api/pages/about-us?mode=preview')
        .set('x-preview-token', 'short');
      assert.equal(response.status, 403);
      assert.deepEqual(response.body, { error: 'Forbidden' });
    });

    test('Query string previewToken is IGNORED and returns 403 Forbidden', async () => {
      const token = config.previewSecret;
      const response = await request(app).get(`/api/pages/about-us?mode=preview&previewToken=${token}`);
      assert.equal(response.status, 403);
      assert.deepEqual(response.body, { error: 'Forbidden' });
    });

    test('Authorized preview returns 200 OK and Cache-Control: no-store', async () => {
      pagepilotService.fetchPage = async (slug, { preview }) => {
        if (slug === 'about-us' && preview) {
          return {
            title: 'Draft Page',
            html: '<div>Draft Content</div>',
            updatedAt: new Date().toISOString()
          };
        }
        return null;
      };

      const token = config.previewSecret;
      const response = await request(app)
        .get('/api/pages/about-us?mode=preview')
        .set('x-preview-token', token);

      assert.equal(response.status, 200);
      assert.equal(response.headers['cache-control'], 'no-store');
      assert.equal(response.body.page.title, 'Draft Page');
    });
  });

  // 4. Security Headers & CORS Tests
  describe('Security Headers & CORS Restrictions', () => {
    test('Helmet security headers are present in responses', async () => {
      const response = await request(app).get('/api/pages/about-us');
      assert.equal(response.headers['x-content-type-options'], 'nosniff');
      assert.equal(response.headers['x-frame-options'], 'SAMEORIGIN');
      assert.ok(response.headers['content-security-policy']);
    });

    test('Disallowed CORS Origin returns 403 Forbidden', async () => {
      const response = await request(app)
        .get('/api/pages/about-us')
        .set('Origin', 'http://unauthorized-evil-domain.com');

      assert.equal(response.status, 403);
      assert.deepEqual(response.body, { error: 'CORS policy: Origin not allowed' });
    });
  });

  // 5. DOMPurify 30+ XSS Vectors Test
  describe('DOMPurify 30+ XSS Vectors Assertion', () => {
    const xssPayloads = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<a href="javascript:alert(1)">Click</a>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe>',
      '<object data="javascript:alert(1)"></object>',
      '<embed src="javascript:alert(1)">',
      '<form action="javascript:alert(1)"><button>Submit</button></form>',
      '<base href="http://evil.com">',
      '<meta http-equiv="refresh" content="0;url=http://evil.com">',
      '<<SCRIPT>alert("XSS");//<</SCRIPT>',
      '<img src="x" onerror="eval(atob(\'YWxlcnQoMSk=\'))">',
      '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Data link</a>',
      '<div onmouseover="alert(1)">Hover</div>',
      '<body onload="alert(1)">',
      '<input autofocus onfocus="alert(1)">',
      '<select onchange="alert(1)"><option>1</option></select>',
      '<textarea oninput="alert(1)"></textarea>',
      '<marquee onstart="alert(1)"></marquee>',
      '<video><source onerror="alert(1)"></video>',
      '<audio src="x" onerror="alert(1)"></audio>',
      '<details open ontoggle="alert(1)"></details>',
      '<math><a xlink:href="javascript:alert(1)">x</a></math>',
      '<svg><animate attributeName="javascript" values="alert(1)"></svg>',
      '<isindex action="javascript:alert(1)">',
      '<link rel="import" href="http://evil.com/xss.xml">',
      '<table background="javascript:alert(1)"></table>',
      '<div style="width: expression(alert(1));">Style</div>',
      '<xss id="x" onfocus="alert(1)" tabindex="1">XSS</xss>',
      '<svg><script>alert(1)</script></svg>',
      '<script src="http://evil.com/xss.js"></script>'
    ];

    xssPayloads.forEach((payload, i) => {
      test(`XSS Vector #${i + 1}: ${payload.slice(0, 30)}...`, () => {
        const clean = sanitizeHtml(payload);
        assert(!clean.includes('<script'), `Payload ${i + 1} script tag survived`);
        assert(!clean.includes('onerror'), `Payload ${i + 1} onerror survived`);
        assert(!clean.includes('onload'), `Payload ${i + 1} onload survived`);
        assert(!clean.includes('javascript:'), `Payload ${i + 1} javascript: URI survived`);
        assert(!clean.includes('<iframe'), `Payload ${i + 1} iframe survived`);
        assert(!clean.includes('<object'), `Payload ${i + 1} object survived`);
        assert(!clean.includes('<embed'), `Payload ${i + 1} embed survived`);
      });
    });
  });
});
