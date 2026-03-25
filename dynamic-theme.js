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
  }
  
  // Ambient beam'i de güncelle
  const ambientBeam = document.getElementById('ambientBeam');
  if (ambientBeam) {
    ambientBeam.style.background = `radial-gradient(ellipse at center, ${color.replace('0.3', '0.15')} 0%, transparent 60%)`;
  }
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
