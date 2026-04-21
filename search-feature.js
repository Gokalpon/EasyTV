// ══════════════════════════════════════════════════
// GELİŞMİŞ ARAMA - Ana Listede Arama/Filtreleme
// ══════════════════════════════════════════════════

let searchQuery = '';
let filterCategory = 'all'; // all, streaming, music, gaming, other
let sortBy = 'name'; // name, price, date

// Arama inputu oluştur ve ekle
function initSearchBar() {
  const tabHeader = document.querySelector('#tab-subs .tab-header');
  if (!tabHeader || document.getElementById('searchBar')) return;
  
  const searchContainer = document.createElement('div');
  searchContainer.id = 'searchContainer';
  searchContainer.style.cssText = `
    padding: 0 20px 12px;
    display: flex;
    gap: 8px;
    align-items: center;
  `;
  
  searchContainer.innerHTML = `
    <div style="flex:1;position:relative;">
      <input 
        id="searchBar" 
        type="text" 
        placeholder="${t('search_placeholder')}" 
        style="
          width:100%;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          border-radius:14px;
          padding:10px 14px 10px 40px;
          color:#fff;
          font-size:14px;
          font-weight:500;
          font-family:inherit;
          outline:none;
          transition:all .2s;
        "
        oninput="handleSearch(this.value)"
      >
      <svg 
        style="position:absolute;left:14px;top:50%;transform:translateY(-50%);pointer-events:none;" 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none"
      >
        <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>
        <path d="M11 11l3.5 3.5" stroke="rgba(255,255,255,.4)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>
    <button 
      id="filterBtn" 
      onclick="toggleFilterMenu()"
      style="
        width:40px;
        height:40px;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.12);
        border-radius:12px;
        display:flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        transition:all .2s;
      "
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 4h14M4 9h10M6 14h6" stroke="rgba(255,255,255,.6)" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
  `;
  
  tabHeader.after(searchContainer);
  
  // Focus style ekle
  const searchInput = document.getElementById('searchBar');
  searchInput.addEventListener('focus', () => {
    searchInput.style.borderColor = 'rgba(130,80,255,.5)';
    searchInput.style.background = 'rgba(255,255,255,.12)';
  });
  searchInput.addEventListener('blur', () => {
    searchInput.style.borderColor = 'rgba(255,255,255,.12)';
    searchInput.style.background = 'rgba(255,255,255,.08)';
  });
}

// Arama işlemi
function handleSearch(query) {
  searchQuery = query.toLowerCase().trim();
  filterAndRenderSubs();
}

// Filtreleme ve sıralama
function filterAndRenderSubs() {
  let filtered = [...SVC];
  
  // Arama filtresi
  if (searchQuery) {
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(searchQuery) ||
      (s.email && s.email.toLowerCase().includes(searchQuery)) ||
      (s.plan && s.plan.toLowerCase().includes(searchQuery))
    );
  }
  
  // Kategori filtresi
  if (filterCategory !== 'all') {
    const categories = {
      streaming: ['netflix', 'disney', 'prime', 'hbo', 'apple', 'youtube'],
      music: ['spotify', 'apple music', 'youtube music'],
      gaming: ['twitch', 'kick', 'xbox', 'playstation'],
    };
    
    filtered = filtered.filter(s => {
      const cat = categories[filterCategory] || [];
      return cat.some(name => s.id.toLowerCase().includes(name) || s.name.toLowerCase().includes(name));
    });
  }
  
  // Sıralama
  filtered.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'price') {
      return (b.price || 0) - (a.price || 0);
    } else if (sortBy === 'date') {
      const dateA = a.renew ? new Date(a.renew) : new Date(0);
      const dateB = b.renew ? new Date(b.renew) : new Date(0);
      return dateA - dateB;
    }
    return 0;
  });
  
  // Render
  renderFilteredSubs(filtered);
}

// Filtrelenmiş abonelikleri göster
function renderFilteredSubs(filtered) {
  const list = document.getElementById('subsList');
  if (!list) return;
  
  if (filtered.length === 0) {
    list.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;">
        <div style="font-size:48px;opacity:.3;">🔍</div>
        <div style="font-size:16px;font-weight:700;color:rgba(255,255,255,.5);">${t('search_no_results')}</div>
        <div style="font-size:13px;color:rgba(255,255,255,.3);">${t('search_try_again')}</div>
      </div>
    `;
    return;
  }
  
  // Orijinal renderSubs fonksiyonunu kullan ama sadece filtered array ile
  const originalSVC = SVC;
  SVC = filtered;
  renderSubs();
  SVC = originalSVC;
}

// Filtre menüsü
function toggleFilterMenu() {
  let menu = document.getElementById('filterMenu');
  
  if (menu) {
    menu.remove();
    return;
  }
  
  menu = document.createElement('div');
  menu.id = 'filterMenu';
  menu.style.cssText = `
    position: absolute;
    top: 160px;
    right: 20px;
    background: rgba(18,19,24,.98);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,.5);
    border: 1px solid rgba(255,255,255,.1);
    z-index: 100;
    min-width: 180px;
  `;
  
  menu.innerHTML = `
    <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.4);padding:8px 10px;letter-spacing:.5px;">${t('search_cat')}</div>
    ${['all', 'streaming', 'music', 'gaming', 'other'].map(cat => `
      <div 
        onclick="selectFilter('${cat}')" 
        style="
          padding:10px 12px;
          border-radius:10px;
          cursor:pointer;
          font-size:14px;
          font-weight:600;
          color:${filterCategory === cat ? '#fff' : 'rgba(255,255,255,.6)'};
          background:${filterCategory === cat ? 'rgba(130,80,255,.2)' : 'transparent'};
          transition:all .15s;
        "
        onmouseover="this.style.background='rgba(255,255,255,.08)'"
        onmouseout="this.style.background='${filterCategory === cat ? 'rgba(130,80,255,.2)' : 'transparent'}'"
      >
        ${t('search_cat_' + cat)}
      </div>
    `).join('')}
    <div style="height:1px;background:rgba(255,255,255,.08);margin:8px 0;"></div>
    <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.4);padding:8px 10px;letter-spacing:.5px;">${t('search_sort')}</div>
    ${['name', 'price', 'date'].map(sort => `
      <div 
        onclick="selectSort('${sort}')" 
        style="
          padding:10px 12px;
          border-radius:10px;
          cursor:pointer;
          font-size:14px;
          font-weight:600;
          color:${sortBy === sort ? '#fff' : 'rgba(255,255,255,.6)'};
          background:${sortBy === sort ? 'rgba(130,80,255,.2)' : 'transparent'};
          transition:all .15s;
        "
        onmouseover="this.style.background='rgba(255,255,255,.08)'"
        onmouseout="this.style.background='${sortBy === sort ? 'rgba(130,80,255,.2)' : 'transparent'}'"
      >
        ${t('search_sort_' + sort)}
      </div>
    `).join('')}
  `;
  
  document.body.appendChild(menu);
  
  // Dışarı tıklayınca kapat
  setTimeout(() => {
    document.addEventListener('click', closeFilterMenu);
  }, 100);
}

function closeFilterMenu(e) {
  const menu = document.getElementById('filterMenu');
  const btn = document.getElementById('filterBtn');
  if (menu && !menu.contains(e.target) && e.target !== btn) {
    menu.remove();
    document.removeEventListener('click', closeFilterMenu);
  }
}

function selectFilter(cat) {
  filterCategory = cat;
  toggleFilterMenu();
  filterAndRenderSubs();
}

function selectSort(sort) {
  sortBy = sort;
  toggleFilterMenu();
  filterAndRenderSubs();
}

// Sayfa yüklendiğinde arama barını ekle
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(initSearchBar, 500);
  });
}
