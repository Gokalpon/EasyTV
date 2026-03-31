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
      height: 200px;
      background: radial-gradient(ellipse at center bottom, ${currentThemeColor} 0%, transparent 70%);
      filter: blur(60px);
      -webkit-filter: blur(60px);
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
    dynamicBg.style.background = `radial-gradient(ellipse at center bottom, ${color} 0%, transparent 70%)`;
    dynamicBg.style.opacity = '1';
    dynamicBg.style.animationPlayState = 'running';
  }
  // Ambient beam'i de güncelle
  const ambientBeam = document.getElementById('ambientBeam');
  if (ambientBeam) {
    ambientBeam.style.background = `radial-gradient(ellipse at center, ${color.replace('0.3', '0.15')} 0%, transparent 60%)`;
    ambientBeam.style.opacity = '0.6';
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
      dynamicBg.style.opacity = '1';
      dynamicBg.style.animationPlayState = 'running';
    }
    if (ambientBeam) {
      ambientBeam.style.opacity = '0.6';
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
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  40% { transform: translateY(-10px) scale(1.04); opacity: 0.8; }
  60% { transform: translateY(10px) scale(0.98); opacity: 0.6; }
  100% { transform: translateY(-5px) scale(1.02); opacity: 0.7; }
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
const style = document.createElement('style');
style.textContent = `
  /* Dinamik tema için ambient beam */
  .ambient-beam {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(ellipse at center, rgba(130,80,255,.15) 0%, transparent 60%);
    filter: blur(80px);
    -webkit-filter: blur(80px);
    pointer-events: none;
    z-index: 1;
    opacity: 0.6;
    transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Bottom nav artık blur arka plana sahip değil */
  #navGlow {
    display: none !important;
  }
`;
document.head.appendChild(style);
