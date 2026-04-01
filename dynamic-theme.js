// ══════════════════════════════════════════════════
// DİNAMİK TEMA - Son Tıklanan Uygulamanın Rengi
// ══════════════════════════════════════════════════

let currentThemeColor = 'rgba(130,80,255,.3)'; // Default mor

// Dinamik blur arka plan elementi oluştur
function initDynamicTheme() {
  // Eski nav glow'u kaldır
  const oldGlow = document.getElementById('navGlow');
  if (oldGlow) {
    oldGlow.style.display = 'none';
  }
  // Yeni dinamik blur arka plan ekle
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
    // Fade in
    setTimeout(() => {
      dynamicBg.style.opacity = '1';
    }, 100);
  }
}

// Tema rengini güncelle
function updateThemeColor(color) {
  if (!color) return;
  currentThemeColor = color;
  const dynamicBg = document.getElementById('dynamicThemeBg');
  if (dynamicBg) {
    dynamicBg.style.background = 'transparent';
    dynamicBg.style.opacity = '0';
    dynamicBg.style.animationPlayState = 'running';
  }
  // Ambient beam'i de güncelle
  const ambientBeam = document.getElementById('ambientBeam');
  if (ambientBeam) {
    ambientBeam.style.background = 'transparent';
    ambientBeam.style.opacity = '0';
    ambientBeam.style.animationPlayState = 'running';
  }
// Her tuş ve servis kutusu tıklandığında ışık efektini göster
document.addEventListener('click', function(e) {
  // Sadece buton, .tile veya .service gibi tıklamalarda göster
  let show = false;
  let el = e.target;
  while (el) {
    if (el.tagName === 'BUTTON' || el.classList?.contains('tile') || el.classList?.contains('service')) {
      show = true;
      break;
    }
    el = el.parentElement;
  }
  const dynamicBg = document.getElementById('dynamicThemeBg');
  const ambientBeam = document.getElementById('ambientBeam');
  if (show) {
    if (dynamicBg) {
      dynamicBg.style.opacity = '0';
      dynamicBg.style.animationPlayState = 'running';
    }
    if (ambientBeam) {
      ambientBeam.style.opacity = '0';
      ambientBeam.style.animationPlayState = 'running';
    }
  } else {
    // Boşluğa tıklanırsa efekt kaybolsun
    if (dynamicBg) {
      dynamicBg.style.opacity = '0';
      dynamicBg.style.animationPlayState = 'paused';
    }
    if (ambientBeam) {
      ambientBeam.style.opacity = '0';
      ambientBeam.style.animationPlayState = 'paused';
    }
  }
});
// Sis gibi hareketli animasyon ekle
const animStyle = document.createElement('style');
animStyle.textContent = `
@keyframes dynamicBeamMove {
  0% { transform: translateY(0) scale(1); opacity: 0.38; }
  40% { transform: translateY(-6px) scale(1.02); opacity: 0.48; }
  60% { transform: translateY(6px) scale(0.99); opacity: 0.3; }
  100% { transform: translateY(-4px) scale(1.01); opacity: 0.4; }
}
`;
document.head.appendChild(animStyle);
}

// Servis kartına tıklandığında tema rengini güncelle
function onServiceClick(serviceId) {
  const service = SVC.find(s => s.id === serviceId);
  if (service && service.color) {
    // Rengi alpha ile ayarla
    const colorWithAlpha = service.color.includes('rgba') 
      ? service.color 
      : service.color.replace('rgb(', 'rgba(').replace(')', ', 0.3)');
    
    updateThemeColor(colorWithAlpha);
  }
}

// Tab değiştiğinde tema rengini güncelle
function onTabChange(tab) {
  // Her tab için farklı renk
  const tabColors = {
    'home': 'rgba(130,80,255,.3)',      // Mor
    'subs': 'rgba(90,200,250,.3)',      // Mavi
    'settings': 'rgba(255,149,0,.3)'    // Turuncu
  };
  
  const color = tabColors[tab] || 'rgba(130,80,255,.3)';
  updateThemeColor(color);
}

// Sayfa yüklendiğinde başlat
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(initDynamicTheme, 500);
  });
}

// CSS ekle
const dynamicThemeStyle = document.createElement('style');
dynamicThemeStyle.textContent = `
  /* Dinamik tema için ambient beam */
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
    transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Bottom nav artık blur arka plana sahip değil */
  .service-selector-card {
    position: relative;
    overflow: visible;
  }
`;
document.head.appendChild(dynamicThemeStyle);
