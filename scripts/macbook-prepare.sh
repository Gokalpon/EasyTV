#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OPEN_XCODE=0
if [[ "${1:-}" == "--open" ]]; then
  OPEN_XCODE=1
fi

echo "EasyTV MacBook iOS prepare"
echo "==========================="

# ── Developer Mode check (iOS 16+) ──────────────────────────────────────────
echo "Checking connected iOS devices for Developer Mode..."
XCODE_MAJOR=$(xcodebuild -version 2>/dev/null | awk 'NR==1{split($2,a,"."); print a[1]}')
if [[ "${XCODE_MAJOR:-0}" -ge 15 ]]; then
  # devicectl available (Xcode 15+)
  DEVICES=$(xcrun devicectl list devices 2>/dev/null | grep -E "iPhone|iPad" || true)
  if [[ -z "$DEVICES" ]]; then
    echo "  No physical device connected. Skipping Developer Mode check."
  else
    echo "$DEVICES"
    echo
    echo "  Attempting to enable Developer Mode on connected device(s)..."
    # Extract device identifiers and try to enable developer mode
    xcrun devicectl list devices 2>/dev/null | grep -E "iPhone|iPad" | awk '{print $NF}' | while read -r DEV_ID; do
      echo "  → xcrun devicectl device enable developer-mode --device $DEV_ID"
      xcrun devicectl device enable developer-mode --device "$DEV_ID" 2>&1 || true
    done
    echo
    echo "  If the command above showed an error, enable Developer Mode manually:"
    echo "  Ayarlar → Gizlilik ve Güvenlik → Developer Mode → Aç → Yeniden Başlat"
  fi
else
  # Xcode < 15: no devicectl, give manual steps
  CONNECTED=$(system_profiler SPUSBDataType 2>/dev/null | grep -E "iPhone|iPad" || true)
  if [[ -n "$CONNECTED" ]]; then
    echo "  iOS cihaz bağlı ama Xcode < 15 — Developer Mode'u manuel aç:"
    echo "  Ayarlar → Gizlilik ve Güvenlik → Developer Mode → Aç → Yeniden Başlat"
  else
    echo "  No physical device detected. Continuing..."
  fi
fi
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js missing. Install Node LTS first: https://nodejs.org/"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm missing. Install Node LTS first: https://nodejs.org/"
  exit 1
fi

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "Xcode command line tools missing. Install/open Xcode, then run:"
  echo "sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
  exit 1
fi

echo "Node: $(node -v)"
echo "npm:  $(npm -v)"
echo "Xcode command line tools: OK"
echo

echo "1/5 Installing dependencies..."
npm install

echo
echo "2/5 Syncing web assets..."
npm run build:sync

echo
echo "3/5 Syncing iOS project..."
npx cap sync ios

echo
echo "4/5 Running release preflight..."
npm run release:preflight

echo
echo "5/5 Clean local-data test plan for this MacBook"
echo "- This Mac has no old EasyTV localStorage, so first launch must show the intro/onboarding flow."
echo "- Test: intro -> account/create or skip/onboarding -> add services -> two-tap logo open -> settings -> delete account."
echo "- If Safari/WebView cache looks stale, delete the app from simulator/device and run again."

if [[ "$OPEN_XCODE" == "1" ]]; then
  echo
  echo "Opening Xcode..."
  npx cap open ios
else
  echo
  echo "Next command when ready:"
  echo "npm run ios:open"
fi

echo
echo "MacBook prepare complete."
