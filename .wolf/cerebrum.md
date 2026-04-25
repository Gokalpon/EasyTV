# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-10

- [2026-04-18] Kullanıcı 'şimdiki adım neyse ona geç' yaklaşımını istiyor; sıradaki işi sormadan otonom devam etmemiz bekleniyor.

- [2026-04-18] Premium paywall tarafında plan seçimi (aylık/yıllık) UI’dan seçilip activatePremium(productId) ile gönderilmeli; sadece defaultProductId’a bırakmak satın alma kontrolünü zayıflatıyor.

- [2026-04-18] initAuth cift tetiklenirse OAuth donusunde fallback/ekran yarisi olusabiliyor; auth baslatma tek noktada kalmali.

- [2026-04-18] Legacy welcome/wlc kodu bırakılırsa auth fallback akışında boş veya eski ekran tetiklenebiliyor; giriş akışı loginScreen + email sheet etrafında tek kaynakta tutulmalı.
- [2026-04-18] iOS OAuth için yalnızca window.location kontrolü yetmiyor; Capacitor App `appUrlOpen` callback’i üzerinden deeplink dönüşü mutlaka işlenmeli.
- [2026-04-18] Bu projede iOS runtime kaynağı `ios/App/App/public`; web değişikliği sonrası `npx cap copy` yapılmazsa iOS tarafında eski davranışlar kalıyor.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- [2026-04-17] Full-function QA için index.html onclick handler seti otomatik taranmalı; özellikle www/index.html ile www/app.js drift’i runtime is not defined hatalarına yol açabiliyor.

- [2026-04-18] Bu projede güvenlik toggle defaultları if(!SETTINGS.x) ile kurulursa kullanıcı kapalı ayarı her reload’da tekrar açılır; mutlaka === undefined kontrolü kullanılmalı.

- [2026-04-18] Premium ödeme entegrasyonunda UI fonksiyonlarını (activatePremium/restorePurchases) doğrudan native bridge'e değil önce ayrı payment-service katmanına bağlamak, fallback ve test edilebilirlik için gerekli.

- [2026-04-18] root/ ve www/ dosyaları (özellikle index.html + app.js + style.css) drift ederse bir ortamda düzelen akış diğerinde bozuluyor; release öncesi birebir senkron zorunlu.
- [2026-04-18] Native OAuth redirect URL sözleşmesi iOS’ta sabit bir custom scheme ile tanımlanmalı (`easytvhub://auth/callback`) ve Supabase allow-list ile uyumlu tutulmalı.



- [2026-04-18] Google OAuth fallbackinde session olusmazsa intro/welcome acmak yerine dogrudan loginScreen acilmali; legacy intro ekrani auth fallbackte asla hedeflenmemeli.
- [2026-04-18] Smoke testte rg yetki hatasi tekrarlandi; bu repoda kod tarama icin varsayilan arac Select-String olmali.
- [2026-04-18] Localhost testlerinde eski auth ekranlari gorunuyorsa once service worker cache etkisi dislanmali; dev ortamda SW unregister iyi bir stabilizasyon guardidir.
- [2026-04-18] Skip auth akısı doğrudan mainApp'e değil onboarding adımlarına giriyor; smoke testte obSkipBtn ile tamamlanıp unlockApp doğrulanmalı.
- [2026-04-18] Bu projede QA için en güvenli yol: repo içi smoke scriptinin static serveri kendi açıp kapatması; dışarıdan server bağımlılığı ERR_CONNECTION_REFUSED üretip testleri yanıltıyor.
- [2026-04-20] i18n için static HTML metinlerinde id yoksa applyLang etkisiz kalıyor; modal/label metinleri id ile işaretlenip applyLang içinde tek noktadan set edilmeli.

- [2026-04-20] App Store uyumlulu?u i?in 'hesap sil' men? aksiyonu placeholder olamaz; en az?ndan cloud veri silme + signout + local temizleme zinciri app i?inden tetiklenmeli.

- [2026-04-20] Kullan?c? giri? deneyiminde intro-first ak??? bekliyor; fallback'i do?rudan login'e zorlamak istenen UX'i bozuyor.

- [2026-04-23] Kullanıcı yeni ürün scaffoldlarında doğrudan çalışır klasör yapısı + terminal komutları + ana UI kodunu tek seferde, gereksiz teori olmadan istemektedir.

- [2026-04-23] Kullanıcı yeni ayrı scaffold yerine mevcut EasyTV kod tabanının bozulmadan hatalarının düzeltilip doğrudan desktop app'e dönüştürülmesini istiyor.

- [2026-04-23] Kullanıcı desktop sürümde görsel netlik (bulanıklık olmaması), giriş ekranının her açılışta görünmesi ve hesap oluştur akışının tek denemede çalışmasını net beklenti olarak belirtiyor.

- [2026-04-23] Kullanıcı mor butonlarda referans görseldeki gibi glowsuz/outline'sız düz tema istiyor; form, oran ve yazı tiplerinin kesinlikle korunmasını bekliyor.

- [2026-04-23] Kullanıcı mevcut aşamada UI polish yerine doğrudan App Store’a çıkış rehberi ve eksik/gap analizine öncelik veriyor.

- [2026-04-23] Capacitor v8'de app-embedded custom plugin için en güvenli yol CAPBridgeViewController subclassında ridge?.registerPluginType(...) ile explicit kayıt yapmak; sadece JS scaffold ile bırakmak IAP'yi App Store review'da işlevsiz bırakıyor.

- [2026-04-23] iOS IAP için client-side başarı sinyali tek başına yeterli değil; production akışında transactionId ile server-side Apple App Store API doğrulaması zorunlu tutulmalı ve premium state yalnızca bu sonuçtan yazılmalı.
