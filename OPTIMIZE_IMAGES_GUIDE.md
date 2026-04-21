# ══════════════════════════════════════════════════
# EasyTV Image Optimization Guide
# Step-by-step image compression workflow
# ══════════════════════════════════════════════════

## 📊 CURRENT STATE (Before Optimization)

| File | Current Size | Target Size | Savings |
|------|-------------|-------------|---------|
| `tvplus.png` | **1.95 MB** | ~50 KB | 97% |
| `box2.png` | **1.55 MB** | ~100 KB | 94% |
| `Disney+.png` | 376 KB | ~30 KB | 92% |
| `apple.png` | 210 KB | ~20 KB | 91% |
| **TOTAL** | **~4.8 MB** | **~500 KB** | **90%** |

---

## 🎯 OPTIMIZATION TARGETS

### Critical (Do First)
- [ ] `tvplus.png` → 200x200px, WebP format, ~50KB
- [ ] `box2.png` → 400x400px, WebP format, ~100KB

### Important (Do Second)
- [ ] `Disney+.png` → 150x150px, WebP format, ~30KB
- [ ] `apple.png` → 150x150px, WebP format, ~20KB

### Nice to Have (Optional)
- [ ] All logos → consistent 150x150px max
- [ ] Convert remaining PNGs to WebP

---

## 🛠️ OPTIMIZATION METHODS

### Method 1: TinyPNG (Recommended - GUI)
1. Visit https://tinypng.com
2. Drag & drop images
3. Download optimized versions
4. Replace in `/assets/` folder

### Method 2: Squoosh (Advanced - CLI)
```bash
# Install squoosh-cli
npx squoosh-cli --png '{"quality":75,"maxWidth":200,"maxHeight":200}'

# Batch optimize
for file in assets/*.png; do
  npx squoosh-cli --webp '{"quality":80,"maxWidth":150,"maxHeight":150}' "$file"
done
```

### Method 3: Sharp (Programmatic)
```javascript
const sharp = require('sharp');

const targets = [
  { input: 'tvplus.png', w: 200, h: 200, quality: 75 },
  { input: 'box2.png', w: 400, h: 400, quality: 80 },
  { input: 'Disney+.png', w: 150, h: 150, quality: 75 },
  { input: 'apple.png', w: 150, h: 150, quality: 75 }
];

for (const t of targets) {
  await sharp(t.input)
    .resize(t.w, t.h, { fit: 'inside' })
    .webp({ quality: t.quality })
    .toBuffer()
    .then(buf => require('fs').writeFileSync(
      t.input.replace('.png', '.webp'), buf
    ));
}
```

---

## 📋 OPTIMIZATION CHECKLIST

After running optimization:

```bash
# Verify sizes
du -h assets/*.webp assets/*.png

# Check total
du -sh assets/

# Expected output: < 500 KB total
```

---

## 🚀 AUTOMATED SCRIPT (if Sharp is installed)

Run this after installing dependencies:
```bash
npm install sharp
node scripts/optimize-images.js
```

---

## ⚠️ IMPORTANT NOTES

1. **Maintain aspect ratio** - Use `fit: 'inside'` or `fit: 'cover'`
2. **WebP priority** - Modern browsers support WebP with PNG fallback
3. **Quality vs Size** - 75-80% quality is usually optimal
4. **Retina support** - If needed, create 2x versions

---

## 📈 EXPECTED RESULTS

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Image Size | 4.8 MB | ~500 KB | **90% ↓** |
| First Load Time | ~3s | ~1s | **67% ↓** |
| Lighthouse Score | ~70 | ~95 | **35% ↑** |

---

**Generated:** 2026-04-22
**Author:** Vibe Coding Lead AI Agent
