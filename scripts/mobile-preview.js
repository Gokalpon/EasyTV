const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, exec } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'www');
const port = Number(process.env.PREVIEW_PORT || 3000);
const shouldOpen = process.argv.includes('--open');
const skipBuild = process.argv.includes('--no-build');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function getLanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((item) => item && item.family === 'IPv4' && !item.internal)
    .map((item) => item.address);
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.end(body);
}

function previewPage(lanUrls) {
  const directUrl = lanUrls[0] || `http://localhost:${port}`;
  const urls = lanUrls.map((url) => `<li><code>${url}</code></li>`).join('');
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EasyTV Mobile Preview</title>
  <style>
    :root{color-scheme:dark;--bg:#07080d;--panel:#11131d;--line:rgba(255,255,255,.12);--text:#f7f4ff;--muted:rgba(247,244,255,.58);--accent:#8f63ff}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;background:radial-gradient(circle at 20% 10%,rgba(143,99,255,.24),transparent 28%),linear-gradient(135deg,#07080d,#050507 56%,#10121c);font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--text);display:grid;grid-template-columns:minmax(320px,430px) minmax(300px,420px);gap:28px;align-items:center;justify-content:center;padding:28px}
    .device{width:min(430px,100%);height:min(852px,calc(100vh - 56px));min-height:720px;border-radius:34px;padding:10px;background:linear-gradient(180deg,#242532,#08090e);box-shadow:0 30px 90px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.12)}
    .screen{width:100%;height:100%;border:0;border-radius:26px;background:#000;overflow:hidden}
    .panel{border:1px solid var(--line);background:rgba(17,19,29,.72);backdrop-filter:blur(22px);border-radius:26px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.32)}
    h1{font-size:24px;line-height:1.12;margin:0 0 10px;letter-spacing:-.04em}
    p{color:var(--muted);line-height:1.55;margin:0 0 18px}
    .button{display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.16);background:linear-gradient(135deg,#8f63ff,#5e38d8);color:white;text-decoration:none;font-weight:800;border-radius:16px;padding:13px 16px;margin:0 8px 10px 0}
    .ghost{background:rgba(255,255,255,.06)}
    ul{padding-left:18px;color:var(--muted)}
    code{color:#fff;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:2px 6px}
    .hint{font-size:13px;border-top:1px solid var(--line);padding-top:16px;margin-top:18px}
    @media(max-width:860px){body{grid-template-columns:1fr;padding:14px}.device{height:78vh;min-height:620px;margin:auto}.panel{order:-1}}
  </style>
</head>
<body>
  <div class="device">
    <iframe class="screen" src="/index.html?desktopPhonePreview=1" title="EasyTV phone preview"></iframe>
  </div>
  <main class="panel">
    <h1>EasyTV telefon önizleme</h1>
    <p>Soldaki alan masaüstünde telefon ekranını sabit ölçüde gösterir. Gerçek telefonda test için aynı Wi-Fi üzerindeyken aşağıdaki LAN adresini Safari/Chrome'da aç.</p>
    <a class="button" href="/index.html" target="_blank" rel="noreferrer">Direkt app'i aç</a>
    <a class="button ghost" href="${directUrl}" target="_blank" rel="noreferrer">Telefondaki URL</a>
    <p><strong>Telefon URL'leri:</strong></p>
    <ul>${urls || `<li><code>http://localhost:${port}</code></li>`}</ul>
    <p class="hint">Not: Telefon açamıyorsa Windows Firewall bu portu engelliyor olabilir. Aynı Wi-Fi'da olduğundan emin ol ve gerekirse <code>PREVIEW_PORT=4173 npm run preview:mobile</code> ile farklı port dene.</p>
  </main>
</body>
</html>`;
}

function safePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const filePath = path.normalize(path.join(webDir, cleanPath));
  return filePath.startsWith(webDir) ? filePath : null;
}

if (!skipBuild) {
  const result = spawnSync('npm', ['run', 'build:sync'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

const server = http.createServer((req, res) => {
  if (!req.url) return send(res, 400, 'Bad request');

  if (req.url.startsWith('/__health')) {
    return send(res, 200, JSON.stringify({ ok: true }), 'application/json; charset=utf-8');
  }

  if (req.url === '/preview' || req.url === '/preview/') {
    const lanUrls = getLanAddresses().map((ip) => `http://${ip}:${port}`);
    return send(res, 200, previewPage(lanUrls), 'text/html; charset=utf-8');
  }

  const filePath = safePath(req.url);
  if (!filePath) return send(res, 403, 'Forbidden');

  fs.stat(filePath, (statErr, stat) => {
    const finalPath = !statErr && stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    fs.readFile(finalPath, (readErr, content) => {
      if (readErr) return send(res, 404, 'Not found');
      const type = mimeTypes[path.extname(finalPath).toLowerCase()] || 'application/octet-stream';
      send(res, 200, content, type);
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  const lanUrls = getLanAddresses().map((ip) => `http://${ip}:${port}`);
  console.log('\nEasyTV mobile preview is ready');
  console.log(`Desktop phone frame: http://localhost:${port}/preview`);
  console.log(`Local app:            http://localhost:${port}`);
  if (lanUrls.length) {
    console.log('Phone on same Wi-Fi:');
    lanUrls.forEach((url) => console.log(`  ${url}`));
  } else {
    console.log('No LAN IPv4 address found. Check Wi-Fi/Ethernet connection.');
  }
  console.log('\nPress Ctrl+C to stop.\n');

  if (shouldOpen) {
    const url = `http://localhost:${port}/preview`;
    const command = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
    exec(command);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try: PREVIEW_PORT=4173 npm run preview:mobile`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
