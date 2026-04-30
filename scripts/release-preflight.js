#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.resolve(ROOT, 'www');
const IOS_PUBLIC = path.resolve(ROOT, 'ios', 'App', 'App', 'public');
const PBXPROJ = path.resolve(ROOT, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
const INFO_PLIST = path.resolve(ROOT, 'ios', 'App', 'App', 'Info.plist');

const EXPECTED_BUNDLE_ID = 'com.easytvhub.app';
const EXPECTED_IOS_TARGET = '16.0';

const CRITICAL_SYNC_FILES = [
  'index.html',
  'app.js',
  'style.css',
  'payment-service.js',
  'premium-system.js',
  'dynamic-theme.js',
  'search-feature.js',
  'privacy.html',
];

const REQUIRED_FILES = [
  'ios/App/App/PrivacyInfo.xcprivacy',
  'ios/App/App/EasyTVPaymentsPlugin.swift',
  'supabase/functions/verify-ios-subscription/index.ts',
  'supabase/functions/delete-account/index.ts',
];

const state = {
  passes: 0,
  warns: 0,
  fails: 0,
};

function printResult(level, title, detail) {
  const icon = level === 'PASS' ? 'PASS' : level === 'WARN' ? 'WARN' : 'FAIL';
  console.log(`[${icon}] ${title}${detail ? ` -> ${detail}` : ''}`);
}

function pass(title, detail = '') {
  state.passes += 1;
  printResult('PASS', title, detail);
}

function warn(title, detail = '') {
  state.warns += 1;
  printResult('WARN', title, detail);
}

function fail(title, detail = '') {
  state.fails += 1;
  printResult('FAIL', title, detail);
}

function fileExists(relPath) {
  return fs.existsSync(path.resolve(ROOT, relPath));
}

function hashFile(absPath) {
  const data = fs.readFileSync(absPath);
  const textLike = ['.html', '.js', '.css', '.json', '.plist', '.ts', '.md', '.swift'].includes(
    path.extname(absPath).toLowerCase()
  );

  const normalized = textLike
    ? data.toString('utf8').replace(/\r\n/g, '\n')
    : data;

  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function compareFilePair(baseDirA, baseDirB, relPath) {
  const fileA = path.resolve(baseDirA, relPath);
  const fileB = path.resolve(baseDirB, relPath);
  if (!fs.existsSync(fileA) || !fs.existsSync(fileB)) {
    return { ok: false, reason: 'missing' };
  }

  const hashA = hashFile(fileA);
  const hashB = hashFile(fileB);
  if (hashA !== hashB) {
    return { ok: false, reason: 'hash-mismatch' };
  }
  return { ok: true, reason: '' };
}

function runSyncCheck(label, dirA, dirB, files) {
  let mismatchCount = 0;
  for (const rel of files) {
    const result = compareFilePair(dirA, dirB, rel);
    if (!result.ok) {
      mismatchCount += 1;
      fail(`${label} sync`, `${rel} (${result.reason})`);
    }
  }

  if (mismatchCount === 0) {
    pass(`${label} sync`, `${files.length} critical file matched`);
  }
}

function runRequiredFilesCheck() {
  const missing = [];
  for (const rel of REQUIRED_FILES) {
    if (!fileExists(rel)) {
      missing.push(rel);
    }
  }

  if (missing.length) {
    fail('Required release files', `missing ${missing.join(', ')}`);
    return;
  }
  pass('Required release files', 'all present');
}

function runPbxprojChecks() {
  if (!fs.existsSync(PBXPROJ)) {
    fail('Xcode project', 'project.pbxproj not found');
    return;
  }

  const content = fs.readFileSync(PBXPROJ, 'utf8');
  const targetMatches = [...content.matchAll(/IPHONEOS_DEPLOYMENT_TARGET = ([0-9.]+);/g)].map((m) => m[1]);
  const uniqueTargets = [...new Set(targetMatches)];

  if (!uniqueTargets.length) {
    fail('iOS deployment target', 'no IPHONEOS_DEPLOYMENT_TARGET found');
  } else if (uniqueTargets.length !== 1 || uniqueTargets[0] !== EXPECTED_IOS_TARGET) {
    fail('iOS deployment target', `expected ${EXPECTED_IOS_TARGET}, found ${uniqueTargets.join(', ')}`);
  } else {
    pass('iOS deployment target', EXPECTED_IOS_TARGET);
  }

  const bundleMatches = [...content.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)].map((m) => m[1].trim());
  const uniqueBundles = [...new Set(bundleMatches)];
  if (!uniqueBundles.length) {
    fail('Bundle identifier', 'PRODUCT_BUNDLE_IDENTIFIER not found');
  } else if (uniqueBundles.some((id) => id !== EXPECTED_BUNDLE_ID)) {
    fail('Bundle identifier', `expected ${EXPECTED_BUNDLE_ID}, found ${uniqueBundles.join(', ')}`);
  } else {
    pass('Bundle identifier', EXPECTED_BUNDLE_ID);
  }
}

function runInfoPlistCheck() {
  if (!fs.existsSync(INFO_PLIST)) {
    fail('Info.plist', 'file not found');
    return;
  }

  const content = fs.readFileSync(INFO_PLIST, 'utf8');
  if (!content.includes('<string>easytvhub</string>')) {
    fail('URL scheme', 'easytvhub scheme missing in Info.plist');
  } else {
    pass('URL scheme', 'easytvhub');
  }
}

function runPrivacyCheck() {
  const privacyManifest = path.resolve(ROOT, 'ios', 'App', 'App', 'PrivacyInfo.xcprivacy');
  if (!fs.existsSync(privacyManifest)) {
    fail('Privacy manifest', 'PrivacyInfo.xcprivacy missing');
    return;
  }

  const content = fs.readFileSync(privacyManifest, 'utf8');
  if (!content.includes('NSPrivacy')) {
    warn('Privacy manifest', 'present but keys should be re-checked in Xcode');
  } else {
    pass('Privacy manifest', 'file and keys detected');
  }
}

function run() {
  console.log('EasyTV iOS Release Preflight');
  console.log('================================');

  runRequiredFilesCheck();
  runSyncCheck('Root -> www', ROOT, WWW, CRITICAL_SYNC_FILES);
  runSyncCheck('www -> ios public', WWW, IOS_PUBLIC, CRITICAL_SYNC_FILES);
  runPbxprojChecks();
  runInfoPlistCheck();
  runPrivacyCheck();

  console.log('================================');
  console.log(`Summary: ${state.passes} pass, ${state.warns} warn, ${state.fails} fail`);

  if (state.fails > 0) {
    process.exit(1);
  }
}

run();
