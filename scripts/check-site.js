const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const htmlFiles = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    if (item === '.git' || item === 'node_modules') continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (item.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);
let errors = 0;
function fail(msg) { errors += 1; console.error('FAIL ' + msg); }
for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  if (!/<title>[^<]+<\/title>/.test(html)) fail(rel + ' missing title');
  if (!/<meta name=\"description\" content=\"[^\"]+\">/.test(html) && !rel.startsWith('downloads/')) fail(rel + ' missing description');
  for (const match of html.matchAll(/(?:href|src)=\"([^\"]+)\"/g)) {
    const url = match[1];
    if (url.includes('${')) continue;
    if (/^(https?:|mailto:|tel:|#|data:)/.test(url)) continue;
    const clean = url.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target)) fail(rel + ' broken local link: ' + url);
  }
}
for (const js of ['api/lead-capture.js', 'api/creem-webhook.js', 'api/_delivery-config.js', 'assets/tracking.js']) {
  const full = path.join(root, js);
  if (!fs.existsSync(full)) fail(js + ' missing');
}
if (errors) process.exit(1);
console.log('Site check passed: ' + htmlFiles.length + ' HTML files scanned.');
