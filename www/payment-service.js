// EasyTV Payment Service (Stage 1-2 scaffold)
// NOTE: Real App Store IAP requires a native bridge plugin + backend verification.
(function () {
  const PRODUCT_IDS = {
    monthly: 'easytv.premium.monthly',
    yearly: 'easytv.premium.yearly'
  };
  const MOCK_KEY = 'easytv_iap_mock_status';

  const state = {
    initialized: false,
    provider: 'none',
    products: [
      { id: PRODUCT_IDS.monthly, title: 'EasyTV Premium Monthly', price: '₺49,99' },
      { id: PRODUCT_IDS.yearly, title: 'EasyTV Premium Yearly', price: '₺499,99' }
    ]
  };

  function readMockStatus() {
    try {
      return JSON.parse(localStorage.getItem(MOCK_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function writeMockStatus(status) {
    try {
      localStorage.setItem(MOCK_KEY, JSON.stringify(status || {}));
    } catch (_) {}
  }

  async function init() {
    if (state.initialized) return state;
    state.initialized = true;
    const nativeBridge = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.EasyTVPayments;
    if (nativeBridge) {
      state.provider = 'native-bridge';
      if (typeof nativeBridge.getProducts === 'function') {
        try {
          const r = await nativeBridge.getProducts({ productIds: Object.values(PRODUCT_IDS) });
          if (r && Array.isArray(r.products) && r.products.length > 0) state.products = r.products;
        } catch (_) {}
      }
    } else if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      state.provider = 'native-unconfigured';
    } else {
      state.provider = 'web-preview';
    }
    return state;
  }

  async function getProducts() {
    await init();
    return state.products;
  }

  function defaultProductId() {
    return PRODUCT_IDS.monthly;
  }

  async function purchase(productId) {
    await init();
    if (state.provider === 'native-bridge') {
      const bridge = window.Capacitor.Plugins.EasyTVPayments;
      if (!bridge || typeof bridge.purchase !== 'function') {
        return { ok: false, code: 'bridge_missing', message: 'Payment bridge is missing.' };
      }
      try {
        const r = await bridge.purchase({ productId: productId || defaultProductId() });
        if (r && r.ok) return { ok: true, source: 'iap', productId: r.productId || productId, expiresAt: r.expiresAt || null };
        return { ok: false, code: (r && r.code) || 'purchase_failed', message: (r && r.message) || 'Purchase failed.' };
      } catch (e) {
        return { ok: false, code: 'purchase_error', message: e && e.message ? e.message : 'Purchase failed.' };
      }
    }
    if (state.provider === 'web-preview') {
      return { ok: false, code: 'web_preview', message: 'Web preview supports mock only. Real purchase is iOS-native.' };
    }
    return { ok: false, code: 'native_unconfigured', message: 'Native payment bridge is not configured yet.' };
  }

  async function restorePurchases() {
    await init();
    if (state.provider === 'native-bridge') {
      const bridge = window.Capacitor.Plugins.EasyTVPayments;
      if (!bridge || typeof bridge.restorePurchases !== 'function') {
        return { ok: false, code: 'bridge_missing', message: 'Restore bridge is missing.' };
      }
      try {
        const r = await bridge.restorePurchases();
        if (r && r.ok) return { ok: true, source: 'iap' };
        return { ok: false, code: (r && r.code) || 'restore_failed', message: (r && r.message) || 'Restore failed.' };
      } catch (e) {
        return { ok: false, code: 'restore_error', message: e && e.message ? e.message : 'Restore failed.' };
      }
    }
    if (state.provider === 'web-preview') {
      const mock = readMockStatus();
      if (mock && mock.active) return { ok: true, source: 'mock' };
      return { ok: false, code: 'no_purchase', message: 'No purchases to restore in preview.' };
    }
    return { ok: false, code: 'native_unconfigured', message: 'Native payment bridge is not configured yet.' };
  }

  async function getSubscriptionStatus() {
    await init();
    if (state.provider === 'native-bridge') {
      const bridge = window.Capacitor.Plugins.EasyTVPayments;
      if (!bridge || typeof bridge.getSubscriptionStatus !== 'function') return { active: false, source: 'iap' };
      try {
        const r = await bridge.getSubscriptionStatus();
        return {
          active: !!(r && r.active),
          source: 'iap',
          productId: r && r.productId ? r.productId : null,
          expiresAt: r && r.expiresAt ? r.expiresAt : null
        };
      } catch (_) {
        return { active: false, source: 'iap' };
      }
    }
    const mock = readMockStatus();
    return {
      active: !!(mock && mock.active),
      source: state.provider === 'web-preview' ? 'mock' : state.provider,
      productId: mock && mock.productId ? mock.productId : null,
      expiresAt: mock && mock.expiresAt ? mock.expiresAt : null
    };
  }

  window.PaymentService = {
    PRODUCT_IDS,
    state,
    init,
    getProducts,
    defaultProductId,
    purchase,
    restorePurchases,
    getSubscriptionStatus,
    // Dev helper: enables mock premium status on web preview.
    setMockStatus: function (active, productId) {
      writeMockStatus({
        active: !!active,
        productId: productId || defaultProductId(),
        expiresAt: null
      });
    }
  };
})();
