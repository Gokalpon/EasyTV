# 🔧 EasyTV Kritik Düzeltmeler

## SORUNLAR VE ÇÖZÜMLERİ

### 1. ❌ Arama Barı Kaldırıldı
**Sorun:** 5-6 uygulama için gereksiz
**Çözüm:** `search-feature.js` script'i HTML'den kaldırıldı

### 2. 🐛 Alt Navigasyon Aktif State Hatası
**Sorun:** Sekme değişince ışık yanlış yerde kalıyor
**Çözüm:** `updateNavGlow()` fonksiyonu düzeltilecek - pozisyon hesaplaması

### 3. ⭐ Premium Butonu Yukarı Taşındı
**Sorun:** Premium çok alttaydı, kullanıcı görmüyordu
**Çözüm:** Premium menüsü artık en üstte (Hesap bölümünün hemen altında)

### 4. 💎 1 Hafta Ücretsiz Deneme Sistemi
**Yeni Özellik:**
- Premium'a ilk geçişte 7 gün ücretsiz
- `SETTINGS.premiumTrialUsed` flag'i
- `SETTINGS.premiumTrialEndDate` tarihi
- Trial bitince otomatik uyarı

### 5. 🚫 7. Hizmet Ekleme Pain Point
**Sorun:** 7. hizmeti eklerken direkt premium'a yönlendiriyor, hizmet eklenmiyor
**Çözüm:** 
- Önce uyarı göster: "6 hizmet limitine ulaştınız. Premium'a geçin veya bir hizmeti kaldırın."
- Kullanıcı seçsin: Premium'a geç / İptal
- İptal ederse modal kapanmasın, kullanıcı başka hizmet seçebilsin

### 6. 🔒 Premium Limit Sistemi (6 Hizmet Max)
**Yeni Mantık:**
- Free kullanıcı: Max 6 hizmet
- Premium kullanıcı: Sınırsız
- Premium'dan çıkınca:
  - İlk 6 hizmet aktif kalır
  - 7+ hizmetler KİLİTLİ olur (silinmez)
  - Kilitli hizmetler:
    - Ana listede gösterilir ama gri/kilitli
    - Düzenlenemez
    - Hesaplamalara dahil edilmez
    - Grafiklerde gösterilmez
  - Kilitli hizmeti düzenlemek için:
    - Başka bir hizmeti çıkar
    - Veya Premium'a geç

## UYGULAMA DETAYLARI

### updateNavGlow() Düzeltmesi
```javascript
function updateNavGlow(tab) {
  const glow = document.getElementById('navGlow');
  const navItem = document.getElementById('nav-' + tab);
  if (!glow || !navItem) return;
  
  // Force reflow before calculating
  void navItem.offsetWidth;
  
  const nav = document.getElementById('bottomNav');
  const navRect = nav.getBoundingClientRect();
  const itemRect = navItem.getBoundingClientRect();
  const center = itemRect.left - navRect.left + itemRect.width / 2;
  
  glow.style.left = (center - 50) + 'px';
  glow.classList.remove('on');
  void glow.offsetWidth;
  glow.classList.add('on');
}
```

### Premium Trial Sistemi
```javascript
// SETTINGS'e eklenecek
SETTINGS = {
  ...
  premiumTrialUsed: false,
  premiumTrialEndDate: null,
  premiumTrialActive: false
}

function activatePremium() {
  // İlk kez premium'a geçiyorsa trial ver
  if (!SETTINGS.premiumTrialUsed) {
    SETTINGS.premiumTrialUsed = true;
    SETTINGS.premiumTrialActive = true;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    SETTINGS.premiumTrialEndDate = endDate.toISOString();
    showErrorToast('7 gün ücretsiz deneme başladı! 🎉', 'success');
  }
  
  SETTINGS.premium = true;
  saveData();
  updatePremiumBadge();
  closePremiumSheet();
}

// Her sayfa yüklendiğinde trial kontrolü
function checkPremiumTrial() {
  if (SETTINGS.premiumTrialActive && SETTINGS.premiumTrialEndDate) {
    const now = new Date();
    const endDate = new Date(SETTINGS.premiumTrialEndDate);
    
    if (now > endDate) {
      // Trial bitti
      SETTINGS.premiumTrialActive = false;
      SETTINGS.premium = false;
      saveData();
      showErrorToast('Ücretsiz deneme süresi doldu. Premium\'a geçin!', 'warning', 6000);
    }
  }
}
```

### 7. Hizmet Ekleme Düzeltmesi
```javascript
function confirmPlanAdd() {
  const existingIdx = SVC.findIndex(sv => sv.id === planModalSvc.id);
  const isNew = existingIdx < 0;
  
  // YENİ: Limit kontrolü - uyarı göster, direkt yönlendirme yapma
  if (isNew && SVC.length >= FREE_LIMIT && !isPremium()) {
    closePlanModal();
    
    // Uyarı modalı göster
    showAlert(
      '🔒',
      'Limit Doldu',
      `Ücretsiz sürümde maksimum ${FREE_LIMIT} hizmet ekleyebilirsiniz. Premium'a geçin veya bir hizmeti kaldırın.`,
      [
        { text: 'Premium\'a Geç', style: 'primary', action: () => { closeAlert(); openPremiumSheet(); } },
        { text: 'İptal', style: 'secondary', action: () => { closeAlert(); openAddModal(); } }
      ]
    );
    return;
  }
  
  // ... rest of the function
}
```

### Premium Limit - Kilitli Hizmetler
```javascript
// Hizmetleri filtrele - sadece aktif olanları göster
function getActiveSubs() {
  if (isPremium()) {
    return SVC; // Premium: tümü aktif
  }
  return SVC.slice(0, FREE_LIMIT); // Free: ilk 6
}

function getLockedSubs() {
  if (isPremium()) {
    return []; // Premium: hiçbiri kilitli değil
  }
  return SVC.slice(FREE_LIMIT); // Free: 7+ kilitli
}

// renderSubs güncelleme
function renderSubs() {
  const active = getActiveSubs();
  const locked = getLockedSubs();
  
  // Aktif hizmetleri render et
  // ...
  
  // Kilitli hizmetleri göster
  if (locked.length > 0) {
    locked.forEach(s => {
      const card = createSubCard(s, true); // true = locked
      list.appendChild(card);
    });
  }
}

function createSubCard(s, isLocked = false) {
  const card = document.createElement('div');
  card.className = 'sub-card' + (isLocked ? ' locked' : '');
  
  if (isLocked) {
    card.style.opacity = '0.5';
    card.style.filter = 'grayscale(0.8)';
    card.onclick = () => {
      showErrorToast('Bu hizmet kilitli. Premium\'a geçin veya başka bir hizmeti kaldırın.', 'warning');
    };
  } else {
    card.onclick = () => openSheet(SVC.indexOf(s));
  }
  
  // ... rest of card creation
  
  return card;
}
```

## CSS EKLEMELERİ

```css
/* Kilitli hizmet kartları */
.sub-card.locked {
  opacity: 0.5;
  filter: grayscale(0.8);
  position: relative;
}

.sub-card.locked::after {
  content: '🔒';
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  opacity: 0.6;
}

.sub-card.locked:active {
  transform: scale(0.98);
}
```

## TEST SENARYOLARI

1. **Alt Nav Test:**
   - Home → Subs → Settings geçişi yap
   - Işık her seferinde doğru yerde mi?

2. **Premium Trial Test:**
   - İlk kez premium'a geç → "7 gün ücretsiz" mesajı
   - Trial süresini manuel olarak geçmiş yap → Otomatik iptal

3. **7. Hizmet Test:**
   - 6 hizmet ekle
   - 7. hizmeti eklemeye çalış → Uyarı modalı
   - "İptal" bas → Add modal tekrar açılsın
   - "Premium'a Geç" bas → Premium sheet açılsın

4. **Kilitli Hizmet Test:**
   - 10 hizmet ekle (premium ile)
   - Premium'dan çık → İlk 6 aktif, 7-10 kilitli
   - Kilitli hizmete tıkla → "Bu hizmet kilitli" mesajı
   - Premium'a tekrar geç → Tüm hizmetler aktif
