const { sanitizeHtml } = require('../src/services/pagepilot');
const assert = require('node:assert/strict');

const payloads = [
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
  '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Data link</a>'
];

console.log('--- DOMPurify XSS Payload Test Results ---');
payloads.forEach((p, idx) => {
  const clean = sanitizeHtml(p);
  console.log(`Payload ${idx + 1}: [RAW: ${p}] -> [CLEAN: ${clean}]`);
  assert(!clean.includes('<script>'), `Payload ${idx + 1} script tag survived`);
  assert(!clean.includes('onerror'), `Payload ${idx + 1} onerror survived`);
  assert(!clean.includes('onload'), `Payload ${idx + 1} onload survived`);
  assert(!clean.includes('javascript:'), `Payload ${idx + 1} javascript: URI survived`);
  assert(!clean.includes('<iframe'), `Payload ${idx + 1} iframe survived`);
  assert(!clean.includes('<object'), `Payload ${idx + 1} object survived`);
  assert(!clean.includes('<embed'), `Payload ${idx + 1} embed survived`);
});
console.log('ALL XSS PAYLOADS SUCCESSFULLY SANITIZED!');
