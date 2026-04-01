// ══════════════════════════════════════════════════
// ERROR HANDLING UI - Kullanıcı Dostu Mesajlar
// ══════════════════════════════════════════════════

// Global error toast container
let errorToastContainer = null;
let _lastErrorToastAt = 0;

function _normalizeErrorText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value && typeof value.message === 'string') return value.message;
  try { return String(value); } catch (e) { return ''; }
}

function _isIgnorableError(msg, src) {
  const text = _normalizeErrorText(msg).toLowerCase();
  const source = String(src || '').toLowerCase();
  if (!text && !source) return true;
  if (text === 'script error.' || text === 'script error') return true;
  if (text.includes('resizeobserver loop limit exceeded')) return true;
  if (text.includes('non-error promise rejection captured')) return true;
  if (text.includes('the message port closed before a response was received')) return true;
  if (source.startsWith('chrome-extension://') || source.startsWith('moz-extension://') || source.startsWith('safari-extension://')) return true;
  if (source && source.startsWith('http') && source.indexOf(window.location.origin.toLowerCase()) !== 0) return true;
  return false;
}

function _shouldShowErrorToast(msg, src) {
  if (_isIgnorableError(msg, src)) return false;
  const now = Date.now();
  if (now - _lastErrorToastAt < 1500) return false;
  _lastErrorToastAt = now;
  return true;
}

// Toast mesajı göster
function showErrorToast(message, type = 'error', duration = 4000) {
  // Container yoksa oluştur
  if (!errorToastContainer) {
    errorToastContainer = document.createElement('div');
    errorToastContainer.id = 'errorToastContainer';
    errorToastContainer.style.cssText = `
      position: fixed;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      pointer-events: none;
      width: 100%;
    `;
    document.body.appendChild(errorToastContainer);
  }

  // Aynı mesajdan çok varsa temizle (kalabalığı önlemek için)
  const existingToasts = errorToastContainer.querySelectorAll('.error-toast');
  if (existingToasts.length > 2) {
    existingToasts[0].remove();
  }

  // Toast elementi oluştur
  const toast = document.createElement('div');
  toast.className = 'error-toast';

  // Type'a göre ışık rengi
  const config = {
    error: { glow: '#ff3b30' },
    success: { glow: '#4cd964' },
    warning: { glow: '#ff3b30' }, // Kullanıcı uyarılarda da kırmızı ışık istedi
    info: { glow: '#007aff' }
  };
  const { glow } = config[type] || config.error;

  toast.style.cssText = `
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(35px) saturate(200%);
    -webkit-backdrop-filter: blur(35px) saturate(200%);
    color: #fff;
    padding: 16px 32px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: all;
    animation: toastSlideIn 0.45s cubic-bezier(.32,.72,0,1);
    position: relative;
    width: fit-content;
    min-width: 260px;
    max-width: 320px;
    margin: 0 auto;
    border: none;
    overflow: visible;
  `;

  // Sol taraftaki parlayan dikey neon ışık şeridi
  const light = document.createElement('div');
  light.style.cssText = `
    position: absolute;
    left: 0;
    top: 15%;
    bottom: 15%;
    width: 4px;
    background: ${glow};
    border-radius: 0 4px 4px 0;
    box-shadow: 2px 0 15px ${glow}, 5px 0 30px ${glow};
    z-index: 2;
  `;
  toast.appendChild(light);

  const textSpan = document.createElement('span');
  textSpan.style.cssText = `
    line-height: 1.5; 
    color: #fff; 
    width: 100%; 
    display: block; 
    position: relative; 
    z-index: 1; 
    text-align: center; 
    letter-spacing: -0.1px;
  `;
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  errorToastContainer.appendChild(toast);

  // Otomatik kaldır
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s cubic-bezier(.55,.06,.68,.19) forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Hata yakalayıcıları güncelle
window.onerror = function(msg, src, line, col, err) {
  console.error('JS HATA:', { msg, src, line, col, err });
  if (_shouldShowErrorToast(msg, src)) {
    const detail = _normalizeErrorText(err || msg).slice(0, 110) || 'Bilinmeyen hata';
    showErrorToast('Hata: ' + detail, 'error', 6000);
  }
  return false;
};

window.addEventListener('unhandledrejection', function(e) {
  const reason = _normalizeErrorText(e.reason);
  console.error('Promise HATA:', e.reason);
  if (_isIgnorableError(reason, '')) return;
  if (reason.toLowerCase().includes('network') || reason.toLowerCase().includes('fetch') || reason.toLowerCase().includes('failed to fetch')) {
    showErrorToast('Bağlantı hatası. İnternet bağlantınızı kontrol edin.', 'warning');
  } else {
    showErrorToast('Promise: ' + reason.slice(0, 110), 'error', 6000);
  }
});

// CSS animasyonları ekle
const style = document.createElement('style');
style.textContent = `
  @keyframes toastSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes toastSlideOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(-20px) scale(0.9);
    }
  }
  
  .error-toast:active {
    transform: scale(0.95);
  }
`;
document.head.appendChild(style);
