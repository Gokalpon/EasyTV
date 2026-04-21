# ══════════════════════════════════════════════════
# EasyTV Modular Architecture
# Phase 2: Code Structure Refactor
# ══════════════════════════════════════════════════

## 📁 PROPOSED FOLDER STRUCTURE

```
EasyTV/
├── src/
│   ├── core/
│   │   ├── constants.js      # POPULAR_SVCS, COUNTRIES, CURRENCIES
│   │   ├── storage.js        # saveData, loadData, _saveSVCEncrypted
│   │   └── i18n.js          # t() translation function
│   ├── auth/
│   │   ├── auth-core.js     # initAuth, onAuthSuccess, signOut
│   │   ├── oauth.js         # loginWithOAuthProvider, OAuth callbacks
│   │   └── pin.js           # PIN system, faceId
│   ├── features/
│   │   ├── services.js      # SVC management, add/edit/delete
│   │   ├── premium.js      # Premium system, trial, limits
│   │   ├── sync.js         # Cloud sync with Supabase
│   │   ├── exchange.js     # Exchange rate fetching
│   │   └── notifications.js # Reminder system
│   ├── ui/
│   │   ├── screens.js      # Screen transitions
│   │   ├── grid.js         # Service grid rendering
│   │   ├── charts.js       # Spending chart
│   │   ├── modals.js       # All modal/sheet management
│   │   └── animations.js    # _charReveal, _initLogoGallery, etc.
│   └── main.js             # Entry point, imports all modules
├── assets/                  # Images (optimized)
├── scripts/
│   ├── build-sync.js       # ✓ Already created
│   └── optimize-images.js  # Image optimization script
├── www/                     # Build output (generated)
└── index.html              # Entry HTML
```

---

## 🎯 REFACTORING PRIORITY

### Priority 1: Extract Constants (Low Risk)
```javascript
// src/core/constants.js
const POPULAR_SVCS = [...];
const COUNTRIES = [...];
const CURRENCIES = [...];
const LOGO = {...};
const SERVICE_MAX_USERS = {...};

export { POPULAR_SVCS, COUNTRIES, CURRENCIES, LOGO, SERVICE_MAX_USERS };
```

### Priority 2: Extract Storage (Medium Risk)
```javascript
// src/core/storage.js
export function saveData() { ... }
export function loadData() { ... }
export async function _saveSVCEncrypted() { ... }
```

### Priority 3: Extract Auth (Medium Risk)
```javascript
// src/auth/auth-core.js
export async function initAuth() { ... }
export async function onAuthSuccess(user) { ... }
export async function signOut() { ... }
```

### Priority 4: Extract Services (High Risk)
```javascript
// src/features/services.js
let SVC = [];
export function addService() { ... }
export function editService() { ... }
export function deleteService() { ... }
export function renderSubs() { ... }
```

---

## 📦 MODULE DEPENDENCY GRAPH

```
main.js
├── core/constants.js
├── core/storage.js
├── core/i18n.js
│   └── core/constants.js
├── auth/auth-core.js
│   ├── core/storage.js
│   └── auth/oauth.js
├── auth/pin.js
├── features/services.js
│   ├── core/storage.js
│   └── core/constants.js
├── features/premium.js
│   ├── core/storage.js
│   └── features/services.js
├── features/sync.js
│   ├── core/storage.js
│   └── features/services.js
├── ui/screens.js
├── ui/modals.js
└── ui/grid.js
    └── features/services.js
```

---

## 🔄 MIGRATION STRATEGY

### Phase 1: Parallel Writing (No Breaking Changes)
1. Create new module files alongside existing code
2. Export functions without removing old code
3. Test that both paths work

### Phase 2: Incremental Switchover
1. Replace inline function calls with imports one by one
2. Test each feature after switchover
3. Keep original code as backup comment

### Phase 3: Cleanup
1. Remove duplicate implementations
2. Remove unused global variables
3. Verify all functionality works

---

## ⏱️ ESTIMATED TIME

| Phase | Time | Description |
|-------|------|-------------|
| Phase 1 | 30 min | Extract constants & storage |
| Phase 2 | 1 hour | Extract auth & services |
| Phase 3 | 1 hour | Extract UI components |
| Testing | 30 min | Full functionality test |
| **Total** | **3 hours** | Complete refactor |

---

## 🧪 TESTING CHECKLIST

After each phase:
- [ ] Login/Logout flow works
- [ ] Service add/edit/delete works
- [ ] Premium system works
- [ ] Cloud sync works
- [ ] PIN/FaceID works
- [ ] Exchange rates load
- [ ] LocalStorage persistence
- [ ] Mobile view renders correctly

---

## 📝 NOTES

- **No build step needed** - Can use ES modules with `<script type="module">`
- **Keep compatibility** - Supabase CDN still works
- **No framework required** - Vanilla JS modules suffice
- **Gradual migration** - Doesn't break existing functionality

---

**Author:** Vibe Coding Lead AI Agent
**Date:** 2026-04-22
