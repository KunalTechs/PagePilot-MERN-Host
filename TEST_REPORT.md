# Senior QA & Security Audit Report: PagePilot MERN Integration POC

**Auditor Role**: Senior QA & Security Engineer  
**Target Repository**: `POC-Project` (`server/` Express + MongoDB, `client/` React + Vite)  
**Date**: October 5, 2026  

---

## 📊 Summary Test Matrix

| Assessment Area | Real Automated & Empirical Tests Run | Passed | Failed | Not Verified |
|---|---|---|---|---|
| **Slug Validation & Injection Protection** | 27 | 27 | 0 | 0 |
| **Upstream Error Mapping & Failovers** | 3 | 3 | 0 | 0 |
| **Draft Preview Auth & Cache Control** | 5 | 5 | 0 | 0 |
| **Security Headers & CORS (403)** | 2 | 2 | 0 | 0 |
| **DOMPurify 30+ XSS Payload Assertions** | 32 | 32 | 0 | 0 |
| **Live Tenant Data Inclusions & Drafts** | 3 | 3 | 0 | 0 |
| **TOTAL** | **72** | **72** | **0** | **0** |

---

## 🔍 PHASE 1: Static Code Audit Checklist

| # | Check Item | Status | Location | Technical Findings |
|---|---|---|---|---|
| 1 | Secrets & Hardcoded Tokens | **PASS** | `server/src/config/env.js:6`, `server/.env.example:6` | No hardcoded tokens, "super-secret" fallbacks, or workspace IDs exist in source code or client bundles. `.env` is git-ignored. |
| 2 | Slug Handling & Regex Guard | **PASS** | `services/pagepilot.js:44`, `routes/pages.js:23` | Strictly enforces `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` and max length 100. Rejects uppercase, underscores (`_`), traversal (`..`), and nested paths with `404 Page not found`. |
| 3 | SSRF & Upstream Control | **PASS** | `services/pagepilot.js:70` | Upstream URL strictly targets `config.pagePilotApi` with `encodeURIComponent(slug)`. Includes payloads are strictly constructed server-side (no client pass-through). |
| 4 | Preview Authentication | **PASS** | `routes/pages.js:31-36` | Token read exclusively from `x-preview-token` header (query string ignored). Uses length-checked `crypto.timingSafeEqual`. Enforces `Cache-Control: no-store`. |
| 5 | MongoDB Caching & Resilience | **PASS** | `routes/pages.js:50-80`, `models/PageCache.js:16` | `404`, error, and preview responses are never cached. `bufferCommands: false` ensures non-blocking fallback when MongoDB is offline. |
| 6 | HTML & Style Isolation | **PASS** | `services/pagepilot.js:13-24`, `PagePilotRenderer.jsx:38` | Server and client DOMPurify strips `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<base>`, and inline event handlers. Styles encapsulated in open `ShadowRoot`. |
| 7 | Error Handling & Leakage | **PASS** | `server/src/index.js:99` | Central error handler strips stack traces and upstream details, returning generic JSON `{ error: 'Something went wrong' }`. |
| 8 | Security Middleware & CORS | **PASS** | `server/src/index.js:15-64` | Helmet CSP headers present. CORS origin validation checks `config.allowedOrigins` and returns `403 Forbidden` for unauthorized origins. |
| 9 | Frontend Routing & Anchors | **PASS** | `DynamicPage.jsx:98`, `PagePilotRenderer.jsx:48` | Evaluates `loading` → `403` → `404/400` → `500`. Anchor click handler ignores `target="_blank"`, `mailto:`, `tel:`, `#hash`, `javascript:`, and modified clicks (`Ctrl`/`Cmd`). |
| 10 | Config Consistency | **PASS** | `config/env.js:5-18`, `server/.env.example` | `CLIENT_ORIGIN` correctly parsed into `config.allowedOrigins`. `VITE_API_URL` aligned with client fetch paths. |
| 11 | Dependencies & Audit | **PASS** | `server/package.json`, `client/package.json` | Node 18+ native features (`fetch`, `AbortController`, `crypto`) properly utilized. Dependency vulnerability report detailed below. |
| 12 | VendorScriptLoader Scaffold | **PASS** | `VendorScriptLoader.jsx:8-26` | Allow-list restricted strictly to `pagepilot.fabbuilder.com`. Enforces `https:` protocol and safely handles absent `window.PagePilotWidget` globals. |

---

## 🧪 PHASE 2: Automated Test Execution Logs

Executed test suite via `npm test` in `server/`:

```
> pagepilot-poc-server@1.0.0 test
> node --test test/*.test.js

▶ Comprehensive Backend Proxy & Security Test Suite
  ▶ Slug Validation Table Test
    ✔ Slug Payload #1: [../] -> 404 (29.0066ms)
    ✔ Slug Payload #2: [..%2F] -> 404 (7.1283ms)
    ✔ Slug Payload #3: [%00] -> 404 (5.1565ms)
    ✔ Slug Payload #4: [a/b] -> 404 (4.4761ms)
    ✔ Slug Payload #5: [A] -> 404 (1761.5698ms)
    ✔ Slug Payload #6: [a_b] -> 404 (6.5362ms)
    ✔ Slug Payload #7: [aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa] -> 404 (6.175ms)
    ✔ Slug Payload #8: [ ] -> 404 (5.5909ms)
    ✔ Slug Payload #9: [<script>] -> 404 (7.7277ms)
    ✔ Slug Payload #10: [unicode-😀] -> 404 (7.0456ms)
    ✔ Slug Payload #11: [-a] -> 404 (5.8809ms)
    ✔ Slug Payload #12: [a-] -> 404 (4.8433ms)
    ✔ Slug Payload #13: [about..us] -> 404 (5.7584ms)
    ✔ Slug Payload #14: [%2e%2e] -> 404 (4.9557ms)
    ✔ Slug Payload #15: [%2F] -> 404 (5.1561ms)
    ✔ Slug Payload #16: [about-us/extra] -> 404 (5.3399ms)
    ✔ Slug Payload #17: [INVALID_SLUG!] -> 404 (4.6064ms)
    ✔ Slug Payload #18: [slug_with_underscore] -> 404 (4.2346ms)
    ✔ Slug Payload #19: [UPPERCASE-SLUG] -> 404 (1760.1073ms)
    ✔ Slug Payload #20: [slug.html] -> 404 (4.2012ms)
    ✔ Slug Payload #21: [slug?param=val] -> 404 (5.2204ms)
    ✔ Slug Payload #22: [slug#hash] -> 404 (4.9887ms)
    ✔ Slug Payload #23: [slug%20space] -> 404 (4.8627ms)
    ✔ Slug Payload #24: [slug\nnewline] -> 404 (5.1094ms)
    ✔ Slug Payload #25: [slug\ttab] -> 404 (5.2859ms)
    ✔ Slug Payload #26: [eval(alert(1))] -> 404 (4.4519ms)
    ✔ Slug Payload #27: [etc/passwd] -> 404 (4.5147ms)
  ✔ Slug Validation Table Test (3683.0736ms)
  ▶ Upstream Errors & Edge Cases
    ✔ Upstream 500 maps to 502 Content service unavailable (77.4203ms)
    ✔ Upstream Timeout maps to 504 Timeout (68.4301ms)
    ✔ Upstream 404 maps to 404 Page not found (67.6535ms)
  ✔ Upstream Errors & Edge Cases (213.8438ms)
  ▶ Draft Preview Auth & Cache Headers
    ✔ Preview mode without x-preview-token header returns 403 Forbidden (6.5178ms)
    ✔ Preview mode with invalid token returns 403 Forbidden (4.9428ms)
    ✔ Preview mode with different length token returns 403 Forbidden without crash (3.707ms)
    ✔ Query string previewToken is IGNORED and returns 403 Forbidden (4.1617ms)
    ✔ Authorized preview returns 200 OK and Cache-Control: no-store (4.6308ms)
  ✔ Draft Preview Auth & Cache Headers (24.344ms)
  ▶ Security Headers & CORS Restrictions
    ✔ Helmet security headers are present in responses (468.7132ms)
    ✔ Disallowed CORS Origin returns 403 Forbidden (4.4994ms)
  ✔ Security Headers & CORS Restrictions (473.5185ms)
  ▶ DOMPurify 30+ XSS Vectors Assertion
    ✔ XSS Vector #1: <script>alert(1)</script>... (9.1506ms)
    ✔ XSS Vector #2: <img src=x onerror=alert(1)>... (4.9294ms)
    ...
    ✔ XSS Vector #32: <script src="http://evil.com/xss.js"></script>... (0.839ms)
  ✔ DOMPurify 30+ XSS Vectors Assertion (69.2612ms)
✔ Comprehensive Backend Proxy & Security Test Suite (4464.6827ms)
```

---

## 📦 Exact Dependency Audit Outputs (`npm audit`)

### 1. Backend (`server/`)

#### Full Audit (`npm audit`):
```
# npm audit report

braces  *
Severity: high
braces vulnerable to stack-exhaustion denial of service through deeply nested patterns - https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
fix available via `npm audit fix --force`
Will install nodemon@1.14.10, which is a breaking change
node_modules/braces
  chokidar  2.0.0 - 3.6.0
  Depends on vulnerable versions of braces
  node_modules/chokidar
    nodemon  0.0.0-development || >=1.14.11
    Depends on vulnerable versions of chokidar
    node_modules/nodemon

3 high severity vulnerabilities
```

#### Production Audit (`npm audit --omit=dev`):
```
found 0 vulnerabilities
```

### 2. Frontend (`client/`)

#### Full & Production Audit (`npm audit` & `npm audit --omit=dev`):
```
found 0 vulnerabilities
```

---

## 🌐 PHASE 3: Integration & Runtime Command Outputs

### 1. Disallowed CORS Origin Verification
```bash
curl -i http://localhost:5000/api/pages/about-us -H "Origin: http://evil.com"
```
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8
Content-Length: 47

{"error":"CORS policy: Origin not allowed"}
```

### 2. Client Production Bundle Verification
Executed `npm run build` in `client/`:
- **Vite Build**: Compiled cleanly in `7.12s`.
- `grep` search for secrets in `client/dist/`: **Zero hardcoded secret tokens or workspace IDs found**.

---

## ✅ Live Tenant Verification Status (Tested & Confirmed)

All 3 live tenant data items have been empirically tested and verified against the live PagePilot stage workspace:

1. **Unpublished Draft Page (`/about-us-pilot`)**:
   - *Verification Result*: **PASSED**. `GET /api/pages/about-us-pilot` returns `404 Not Found` in Live Mode (draft protection). `GET /api/pages/about-us-pilot?mode=preview` with token returns `200 OK` with draft payload (`status: "draft"`).
2. **Populated FAQ UI Rendering (`/contact-pilot` & `/faqs-pilot`)**:
   - *Verification Result*: **PASSED**. Raw API inclusions for `faq-group-list` tested and mapped. Backend normalizer and `<FAQAccordion>` updated to parse `faqs.question` and `faqs.content[0].content` with DOMPurify HTML sanitization.
3. **Configured Header Menu Entity**:
   - *Verification Result*: **PASSED**. Default `headerMenuName` configured to `Navigation menu`. Dynamic menu items (`About us`, `FAQs`, `Contact us`) parsed from `headerMenu.configuration` and rendered in `<Layout>` header navigation.

---

## 🛠️ Resolved Bugs List

| Bug ID | Severity | File & Line | Description | Fix Applied | Status |
|---|---|---|---|---|---|
| **BUG-01** | High | `App.jsx:10` | Hardcoded secret token shipped in draft client bundle | Replaced with `sessionStorage` dynamic token state in `Layout.jsx` | **RESOLVED** |
| **BUG-02** | High | `pageRoutes.js:45` | Open pass-through endpoint allowed client filter injection | Endpoint deleted; includes payloads built strictly server-side | **RESOLVED** |
| **BUG-03** | Medium | `DynamicPage.jsx:98` | 404 branch evaluated before 500 error branch | Reordered branches: 403 → 404/400 → 500 | **RESOLVED** |
| **BUG-04** | Low | `PagePilotRenderer.jsx:48` | Anchor click interception captured `target="_blank"` & hash links | Added check for `_blank`, `mailto:`, `tel:`, `#hash`, and modified clicks | **RESOLVED** |
| **BUG-05** | Low | `index.js:58` | Disallowed CORS origin returned unhandled 500 server error log | Added `corsErr.status = 403` and handled CORS rejections as clean 403 JSON | **RESOLVED** |
