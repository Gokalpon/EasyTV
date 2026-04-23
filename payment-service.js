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
      { id: PRODUCT_IDS.monthly, title: 'EasyTV Premium Monthly', price: '₺49,99', period: 'monthly' },
      { id: PRODUCT_IDS.yearly, title: 'EasyTV Premium Yearly', price: '₺399,99', period: 'yearly' }
    ]
  };

  function ok(extra) {
    return Object.assign({ ok: true, source: state.provider }, extra || {});
  }

  function fail(code, message, extra) {
    return Object.assign({
      ok: false,
      source: state.provider,
      code: code || 'unknown_error',
      message: message || 'Unknown payment error.'
    }, extra || {});
  }

  function normalizeProducts(products) {
    if (!Array.isArray(products)) return [];
    return products.map(function (p) {
      if (!p || !p.id) return null;
      var yearly = /year|annual|12m/i.test(String(p.id));
      return {
        id: String(p.id),
        title: p.title || p.localizedTitle || (yearly ? 'EasyTV Premium Yearly' : 'EasyTV Premium Monthly'),
        price: p.price || p.localizedPrice || p.displayPrice || (yearly ? '₺399,99' : '₺49,99'),
        period: p.period || p.subscriptionPeriod || (yearly ? 'yearly' : 'monthly')
      };
    }).filter(Boolean);
  }

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
          if (r && Array.isArray(r.products) && r.products.length > 0) {
            const normalized = normalizeProducts(r.products);
            if (normalized.length > 0) state.products = normalized;
          }
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
    return normalizeProducts(state.products);
  }

  function defaultProductId() {
    return PRODUCT_IDS.monthly;
  }

  async function purchase(productId) {
    await init();
    if (state.provider === 'native-bridge') {
      const bridge = window.Capacitor.Plugins.EasyTVPayments;
      if (!bridge || typeof bridge.purchase !== 'function') {
        return fail('bridge_missing', 'Payment bridge is missing.');
      }
      try {
        const r = await bridge.purchase({ productId: productId || defaultProductId() });
        if (r && r.ok) {
          return ok({
            source: 'iap',
            productId: r.productId || productId,
            expiresAt: r.expiresAt || null,
            transactionId: r.transactionId || null,
            originalTransactionId: r.originalTransactionId || null
          });
        }
        return fail((r && r.code) || 'purchase_failed', (r && r.message) || 'Purchase failed.');
      } catch (e) {
        return fail('purchase_error', e && e.message ? e.message : 'Purchase failed.');
      }
    }
    if (state.provider === 'web-preview') {
      return fail('web_preview', 'Web preview supports mock only. Real purchase is iOS-native.');
    }
    return fail('native_unconfigured', 'Native payment bridge is not configured yet.');
  }

  async function restorePurchases() {
    await init();
    if (state.provider === 'native-bridge') {
      const bridge = window.Capacitor.Plugins.EasyTVPayments;
      if (!bridge || typeof bridge.restorePurchases !== 'function') {
        return fail('bridge_missing', 'Restore bridge is missing.');
      }
      try {
        const r = await bridge.restorePurchases();
        if (r && r.ok) {
          return ok({
            source: 'iap',
            productId: r.productId || null,
            expiresAt: r.expiresAt || null,
            transactionId: r.transactionId || null,
            originalTransactionId: r.originalTransactionId || null
          });
        }
        return fail((r && r.code) || 'restore_failed', (r && r.message) || 'Restore failed.');
      } catch (e) {
        return fail('restore_error', e && e.message ? e.message : 'Restore failed.');
      }
    }
    if (state.provider === 'web-preview') {
      const mock = readMockStatus();
      if (mock && mock.active) return ok({ source: 'mock' });
      return fail('no_purchase', 'No purchases to restore in preview.');
    }
    return fail('native_unconfigured', 'Native payment bridge is not configured yet.');
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
          expiresAt: r && r.expiresAt ? r.expiresAt : null,
          transactionId: r && r.transactionId ? r.transactionId : null,
          originalTransactionId: r && r.originalTransactionId ? r.originalTransactionId : null
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
      expiresAt: mock && mock.expiresAt ? mock.expiresAt : null,
      transactionId: null,
      originalTransactionId: null
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
