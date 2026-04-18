const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = process.cwd();
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

function createStaticServer() {
  return http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const filePath = path.join(ROOT, reqPath === '/' ? 'index.html' : reqPath);
    const safePath = path.normalize(filePath);
    if (!safePath.startsWith(ROOT)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    fs.readFile(safePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      const ext = path.extname(safePath).toLowerCase();
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      res.end(data);
    });
  });
}

async function run() {
  const errors = [];
  const server = createStaticServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, resolve);
  });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  page.on('pageerror', (e) => errors.push({ name: 'pageerror', message: e.message }));

  const check = async (name, fn) => {
    try {
      await fn();
      console.log('PASS:', name);
    } catch (e) {
      console.log('FAIL:', name, '-', e.message);
      errors.push({ name, message: e.message });
    }
  };

  try {
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await check('Login screen visible', async () => {
      await page.waitForSelector('#loginScreen', { state: 'visible', timeout: 10000 });
    });

    await check('Skip auth onboarding path reaches main app', async () => {
      await page.click('#loginSkipText');
      await page.waitForSelector('#onboardScreen', { state: 'visible', timeout: 10000 });
      await page.click('#obSkipBtn');
      await page.waitForTimeout(300);
      await page.click('#obSkipBtn');
      await page.waitForSelector('#mainApp', { state: 'visible', timeout: 10000 });
    });

    let svcName = '';
    await check('Add custom service works', async () => {
      svcName = `QAService_${Date.now().toString().slice(-6)}`;
      await page.click('#mainAddBtn');
      await page.waitForSelector('#addModal', { state: 'visible', timeout: 5000 });
      await page.click('#tab-custom');
      await page.fill('#addName', svcName);
      await page.fill('#addUrl', 'example.com');
      await page.fill('#addEmail', 'qa@example.com');
      await page.fill('#addPwd', 'Passw0rd!');
      await page.fill('#addPrice', '99');
      await page.fill('#addRenew', '2026-12-31');
      await page.click('#customTab .add-save-btn');
      await page.waitForTimeout(900);
      const gridText = await page.locator('#grid').innerText();
      if (!gridText.includes(svcName)) throw new Error('Service not found in grid');
    });

    await check('Service edit modal opens from subs', async () => {
      await page.click('#nav-subs');
      await page.waitForTimeout(500);
      const editBtn = page.locator('#subsList button', { hasText: /Düzenle|Edit/i }).first();
      await editBtn.click();
      await page.waitForSelector('#subEditModal', { state: 'visible', timeout: 5000 });
      await page.click('#seCloseBtn');
    });

    await check('Profile edit save works', async () => {
      const newName = `QA User ${Date.now().toString().slice(-4)}`;
      await page.click('#nav-settings');
      await page.waitForTimeout(500);
      await page.locator('div[onclick="openEditProfile()"]').first().click();
      await page.waitForSelector('#editModal.open', { timeout: 5000 });
      await page.fill('#editName', newName);
      await page.click('#editModal .add-save-btn');
      await page.waitForTimeout(400);
      const profileName = await page.locator('#profileName').innerText();
      if (!profileName.includes(newName)) throw new Error('Profile name not updated');
    });

    await check('Language switch updates labels', async () => {
      const before = await page.locator('#title-settings').innerText();
      await page.evaluate(() => window.cycleLang && window.cycleLang());
      await page.waitForTimeout(500);
      const after = await page.locator('#title-settings').innerText();
      if (before === after) throw new Error('Language label unchanged');
    });
  } finally {
    await browser.close();
    server.close();
  }

  if (errors.length) {
    console.log('\nSMOKE RESULT: FAIL');
    console.log(JSON.stringify(errors, null, 2));
    process.exit(1);
  }

  console.log('\nSMOKE RESULT: PASS');
}

run().catch((e) => {
  console.error('SMOKE CRASH:', e);
  process.exit(1);
});
