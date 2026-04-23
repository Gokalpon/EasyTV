// ══════════════════════════════════════════════════
// EasyTV Build Script
// Syncs source files to www/ build directory
// Run: node scripts/build-sync.js
// ══════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.resolve(ROOT, 'www');
const ASSETS_SRC = path.resolve(ROOT, 'assets');
const ASSETS_DST = path.resolve(WWW, 'assets');

const SOURCE_FILES = [
  'index.html',
  'app.js',
  'style.css',
  'error-handler.js',
  'premium-system.js',
  'dynamic-theme.js',
  'search-feature.js',
  'payment-service.js',
  'raleway-font.css',
  'akira-font.css',
  'ubuntu-font.css',
  'h3heading.tailwind.css',
  'animated-h3.js',
  'H3Heading.jsx',
  'service-worker.js',
  'manifest.webmanifest',
  'vercel.json',
  'netlify.toml',
  'capacitor.config.json',
  'privacy.html',
  'SCREENSHOT_REHBERI.html'
];

const MODULE_DIRS = ['src'];

const ASSET_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
  console.log(`  ✓ ${path.relative(ROOT, src)}`);
}

function copyDir(src, dst, extensions) {
  ensureDir(dst);
  if (!fs.existsSync(src)) {
    console.log(`  ⚠ Dir not found: ${src}`);
    return;
  }
  
  const files = fs.readdirSync(src);
  let count = 0;
  
  for (const file of files) {
    const srcPath = path.join(src, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      continue;
    }
    
    const ext = path.extname(file).toLowerCase();
    if (extensions.includes(ext)) {
      copyFile(srcPath, path.join(dst, file));
      count++;
    }
  }
  
  console.log(`  ✓ ${count} ${extensions.join('/')} files from ${path.basename(src)}`);
}

function copyModuleDir(modulePath) {
  const srcDir = path.resolve(ROOT, modulePath);
  const dstDir = path.resolve(WWW, modulePath);
  
  if (!fs.existsSync(srcDir)) {
    console.log(`  ⚠ Module dir not found: ${modulePath}`);
    return;
  }
  
  ensureDir(dstDir);
  
  function copyRecursive(src, dst) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const dstPath = path.join(dst, entry.name);
      
      if (entry.isDirectory()) {
        ensureDir(dstPath);
        copyRecursive(srcPath, dstPath);
      } else {
        copyFile(srcPath, dstPath);
      }
    }
  }
  
  copyRecursive(srcDir, dstDir);
  console.log(`  ✓ ${modulePath}/ directory`);
}

function cleanDir(dir, keepDirs = []) {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (keepDirs.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  }
}

function build() {
  console.log('\n🔄 EasyTV Build Sync');
  console.log('═══════════════════════════════');
  
  // Clean www/ except assets
  console.log('\n🧹 Cleaning www/...');
  cleanDir(WWW, ['assets', 'node_modules']);
  ensureDir(ASSETS_DST);
  
  // Copy source files
  console.log('\n📄 Copying source files...');
  for (const file of SOURCE_FILES) {
    const src = path.join(ROOT, file);
    const dst = path.join(WWW, file);
    if (fs.existsSync(src)) {
      copyFile(src, dst);
    } else {
      console.log(`  ⚠ Missing: ${file}`);
    }
  }
  
  // Copy assets
  console.log('\n🖼️ Copying assets...');
  copyDir(ASSETS_SRC, ASSETS_DST, ASSET_EXTENSIONS);
  
  // Copy Capacitor config
  console.log('\n⚡ Copying Capacitor configs...');
  const capacitorConfig = path.join(ROOT, 'capacitor.config.json');
  if (fs.existsSync(capacitorConfig)) {
    const iosConfig = path.join(ROOT, 'ios', 'App', 'App', 'capacitor.config.json');
    if (fs.existsSync(iosConfig)) {
      copyFile(iosConfig, path.join(WWW, 'capacitor.config.json'));
    }
  }
  
  // Copy modular src directories
  console.log('\n📦 Copying module directories...');
  for (const moduleDir of MODULE_DIRS) {
    copyModuleDir(moduleDir);
  }
  
  console.log('\n✅ Build sync complete!');
  console.log(`📁 Output: ${WWW}`);
  console.log('\n💡 Next: Run "npx cap sync" to sync with native projects');
}

build();
