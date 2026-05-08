// ══════════════════════════════════════════════════
// DİNAMİK TEMA - Son Tıklanan Uygulamanın Rengi
// ══════════════════════════════════════════════════

let currentThemeColor = 'rgba(130,80,255,.3)';

// Cached element refs — DOM'u tekrar sorgulamayı önler
let _dynBg = null;
let _dynBeam = null;

function _getDynEls() {
  if (!_dynBg) _dynBg = document.getElementById('dynamicThemeBg');
  if (!_dynBeam) _dynBeam = document.getElementById('ambientBeam');
}

function initDynamicTheme() {
  const oldGlow = document.getElementById('navGlow');
  if (oldGlow) oldGlow.style.display = 'none';

  let dynamicBg = document.getElementById('dynamicThemeBg');
  if (!dynamicBg) {
    dynamicBg = document.createElement('div');
    dynamicBg.id = 'dynamicThemeBg';
    dynamicBg.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 140px;
      background: transparent;
      filter: blur(44px);
      -webkit-filter: blur(44px);
      pointer-events: none;
      z-index: 49;
      opacity: 0;
      transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
      animation: dynamicBeamMove 8s linear infinite alternate;
    `;
    document.body.appendChild(dynamicBg);
    setTimeout(() => { dynamicBg.style.opacity = '1'; }, 100);
  }
  _dynBg = dynamicBg;
  _dynBeam = document.getElementById('ambientBeam');
}

function updateThemeColor(color) {
  if (!color) return;
  currentThemeColor = color;
  _getDynEls();
  if (_dynBg) {
    _dynBg.style.background = 'transparent';
    _dynBg.style.opacity = '0';
    _dynBg.style.animationPlayState = 'running';
  }
  // ambientBeam'i burada sıfırlamıyoruz — applyServiceThemeEffects zaten yönetiyor
}

// Click listener tek sefer kayıt edilir (initDynamicTheme sonrası)
function _initClickListener() {
  document.addEventListener('click', function(e) {
    _getDynEls();
    let show = false;
    let el = e.target;
    while (el) {
      if (el.tagName === 'BUTTON' || el.classList?.contains('tile') || el.classList?.contains('service')) {
        show = true;
        break;
      }
      el = el.parentElement;
    }
    if (show) {
      if (_dynBg) { _dynBg.style.opacity = '0'; _dynBg.style.animationPlayState = 'running'; }
    } else {
      if (_dynBg) { _dynBg.style.opacity = '0'; _dynBg.style.animationPlayState = 'paused'; }
      if (_dynBeam) { _dynBeam.style.opacity = '0'; _dynBeam.style.animationPlayState = 'paused'; }
    }
  }, { passive: true });
}

function onServiceClick(serviceId) {
  const service = SVC.find(s => s.id === serviceId);
  if (service && service.color) {
    const colorWithAlpha = service.color.includes('rgba')
      ? service.color
      : service.color.replace('rgb(', 'rgba(').replace(')', ', 0.3)');
    updateThemeColor(colorWithAlpha);
  }
}

function onTabChange(tab) {
  const tabColors = {
    'home': 'rgba(130,80,255,.3)',
    'subs': 'rgba(90,200,250,.3)',
    'settings': 'rgba(255,149,0,.3)'
  };
  updateThemeColor(tabColors[tab] || 'rgba(130,80,255,.3)');
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      initDynamicTheme();
      _initClickListener();
    }, 500);
  });
}

const dynamicThemeStyle = document.createElement('style');
dynamicThemeStyle.textContent = `
@keyframes dynamicBeamMove {
  0%   { transform: translateY(0) scale(1); opacity: 0.38; }
  40%  { transform: translateY(-6px) scale(1.02); opacity: 0.48; }
  60%  { transform: translateY(6px) scale(0.99); opacity: 0.3; }
  100% { transform: translateY(-4px) scale(1.01); opacity: 0.4; }
}
.ambient-beam {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  height: 420px;
  background: transparent;
  filter: blur(56px);
  -webkit-filter: blur(56px);
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: background 0.4s ease, opacity 0.3s ease;
}
.service-selector-card { position: relative; overflow: visible; }
`;
document.head.appendChild(dynamicThemeStyle);
