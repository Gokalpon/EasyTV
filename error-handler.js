// ══════════════════════════════════════════════════
// ERROR HANDLING UI - Kullanıcı Dostu Mesajlar
// ══════════════════════════════════════════════════

// Global error toast container
let errorToastContainer = null;

// Toast mesajı göster
function showErrorToast(message, type = 'error', duration = 4000) {
  // Container yoksa oluştur
  if (!errorToastContainer) {
    errorToastContainer = document.createElement('div');
    errorToastContainer.id = 'errorToastContainer';
    errorToastContainer.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      width: 90%;
      max-width: 360px;
    `;
    document.body.appendChild(errorToastContainer);
  }

  // Toast elementi oluştur
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  
  // Type'a göre renk ve icon
  const config = {
    error: { bg: 'rgba(255,59,48,.95)', icon: '⚠️' },
    success: { bg: 'rgba(52,199,89,.95)', icon: '✓' },
    warning: { bg: 'rgba(255,159,10,.95)', icon: '⚡' },
    info: { bg: 'rgba(90,200,250,.95)', icon: 'ℹ️' }
  };
  
  const { bg, icon } = config[type] || config.error;
  
  toast.style.cssText = `
    background: ${bg};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    color: #fff;
    padding: 14px 18px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(0,0,0,.4), 0 2px 8px rgba(0,0,0,.2);
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: all;
    animation: toastSlideIn 0.3s cubic-bezier(.34,1.56,.64,1);
    border: 1px solid rgba(255,255,255,.2);
  `;
  
  toast.innerHTML = `
    <span style="font-size:18px;flex-shrink:0;">${icon}</span>
    <span style="flex:1;line-height:1.4;">${message}</span>
  `;
  
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
  console.error('JS HATA:', msg, 'satır:', line, err);
  showErrorToast('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
  return false;
};

window.addEventListener('unhandledrejection', function(e) {
  console.error('Promise HATA:', e.reason);
  showErrorToast('Bağlantı hatası. İnternet bağlantınızı kontrol edin.', 'warning');
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
