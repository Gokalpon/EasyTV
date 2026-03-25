// ══════════════════════════════════════════════════
// PREMIUM LIMIT SİSTEMİ - Kilitli Hizmetler
// ══════════════════════════════════════════════════

// Aktif hizmetleri getir (free: ilk 6, premium: tümü)
function getActiveSubs() {
  if (isPremium()) {
    return SVC; // Premium: tümü aktif
  }
  return SVC.slice(0, FREE_LIMIT); // Free: ilk 6
}

// Kilitli hizmetleri getir (free: 7+, premium: yok)
function getLockedSubs() {
  if (isPremium()) {
    return []; // Premium: hiçbiri kilitli değil
  }
  return SVC.slice(FREE_LIMIT); // Free: 7+ kilitli
}

// Premium trial kontrolü - sayfa yüklendiğinde çalışır
function checkPremiumTrial() {
  if (SETTINGS.premiumTrialActive && SETTINGS.premiumTrialEndDate) {
    const now = new Date();
    const endDate = new Date(SETTINGS.premiumTrialEndDate);
    
    if (now > endDate) {
      // Trial bitti
      SETTINGS.premiumTrialActive = false;
      SETTINGS.premium = false;
      saveData();
      
      setTimeout(() => {
        showErrorToast('⏰ Ücretsiz deneme süresi doldu. Premium\'a geçin!', 'warning', 6000);
      }, 2000);
    } else {
      // Trial hala aktif - kalan günleri göster
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      console.log('Premium trial aktif - ' + daysLeft + ' gün kaldı');
    }
  }
}

// SETTINGS'e trial alanlarını ekle (eğer yoksa)
function initPremiumSettings() {
  if (typeof SETTINGS.premiumTrialUsed === 'undefined') {
    SETTINGS.premiumTrialUsed = false;
  }
  if (typeof SETTINGS.premiumTrialActive === 'undefined') {
    SETTINGS.premiumTrialActive = false;
  }
  if (typeof SETTINGS.premiumTrialEndDate === 'undefined') {
    SETTINGS.premiumTrialEndDate = null;
  }
}

// Sayfa yüklendiğinde trial kontrolü yap
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      initPremiumSettings();
      checkPremiumTrial();
    }, 1000);
  });
}
