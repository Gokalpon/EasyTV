# EasyTV iOS Stabilizasyon Audit Raporu

## Durum Özeti
| Durum | Özet |
|---|---|
| [DONE] | iOS katman envanteri ve veri akışı haritası çıkarıldı |
| [DONE] | Functional/Broken matrisleri oluşturuldu |
| [DONE] | SWOT + kök neden analizi tamamlandı |
| [DONE] | Sprint bazlı stabilizasyon backlog’u ve DoD tanımlandı |
| [PENDING] | Native payment bridge implementasyonu (`EasyTVPayments`) |
| [PENDING] | iOS simulator/device üstünde uçtan uca OAuth ve IAP doğrulaması |

## iOS Katman Envanteri ve Veri Akışı
- iOS host: `ios/App/App` (`AppDelegate.swift`, `Info.plist`, `public/*`).
- Web runtime kaynağı: `www/*` -> `npx cap copy` ile `ios/App/App/public/*`.
- OAuth callback zinciri:
  1. JS `loginWithOAuthProvider` -> `redirectTo`.
  2. iOS app deeplink açılışı (`easytvhub://auth/callback`).
  3. `AppDelegate` URL open proxy -> Capacitor `App` plugin.
  4. JS `appUrlOpen` listener -> Supabase session exchange/setSession -> `onAuthSuccess`.
- Payment akışı:
  1. UI `activatePremium / restorePurchases`.
  2. `payment-service.js` -> `window.Capacitor.Plugins.EasyTVPayments`.
  3. Bridge yoksa standart hata kodları ile fallback.
- Biometric akış:
  - JS WebAuthn (`navigator.credentials.create/get`) + PIN fallback.

## Functional Matrix (Ekran/Akış Bazlı)
| Akış | Durum | Kanıt |
|---|---|---|
| App launch ve URL routing | Functional | `AppDelegate` `open url` ve `continue userActivity` proxy’leri aktif |
| Session restore (mevcut oturum) | Functional | `initAuth -> getSession -> onAuthSuccess` |
| iOS deeplink callback yakalama | Functional (bu çalışma ile) | `appUrlOpen` listener + pending callback işleme |
| OAuth redirect URL seçimi | Functional (bu çalışma ile) | Native platformda sabit callback URL kullanımı |
| Web asset senkronu (`www` -> iOS public) | Functional (bu çalışma ile) | `cap copy` sonrası hash eşleşmesi |
| Premium fallback davranışı | Functional | Bridge yoksa kodlanmış hata dönüşleri mevcut |

## Broken Matrix
| Öncelik | Semptom | Teknik Neden | Etkilenen Dosya/Modül | Risk |
|---|---|---|---|---|
| P0 | iOS’ta OAuth dönüşü bazen oturum açmıyor/yanlış ekrana düşüyor | Native callback URL JS tarafından dinlenmiyordu; redirect URL native için stabil değildi | `app.js`, `www/app.js`, `ios/App/App/Info.plist` | Auth blokajı |
| P0 | iOS app webdeki son değişiklikleri göstermiyor | `ios/App/App/public` ile `www` drift | iOS `public/*`, `www/*` | Üretimde eski akış/hata |
| P1 | Premium satın alma/restore native’de çalışmıyor | `EasyTVPayments` plugin implementasyonu yok | `payment-service.js`, iOS plugin katmanı (eksik) | Gelir akışı blokajı |
| P1 | IAP güvenlik doğrulaması yok | Sunucu-side receipt validation entegrasyonu yok | Payment backend (eksik) | Sahte premium riski |
| P2 | WebAuthn davranışı cihaz/sürüm varyasyonuna bağlı | WKWebView + platform destek farkları | `app.js` biometric akışı | Tutarsız UX |

## SWOT
### Strengths
- Capacitor iOS host minimal ve temiz; URL open proxy doğru.
- Auth, premium, settings, PIN akışları JS tarafında ayrıştırılmış.
- iOS deployment hedefi, package ve app target seviyesinde tutarlı (`18.0`).

### Weaknesses
- Native bridge bağımlılıkları (özellikle ödeme) implementasyon eksik.
- iOS public bundle drift’i geçmişte operasyonel risk üretmiş.
- Kritik akışlarda (OAuth/IAP) tam E2E native test otomasyonu yok.

### Opportunities
- Tek sprintte auth callback + bundle sync standardizasyonu ile yüksek risk düşüşü.
- Payment servisinde standart hata kontratı sayesinde UI/telemetry sadeleşir.
- “cap copy zorunlu pre-release gate” ile tekrar eden üretim hataları engellenir.

### Threats
- App Store review’da IAP ve auth edge-case regresyonu.
- Native plugin eksikleri nedeniyle premium monetization gecikmesi.
- Cihaz/sürüm farklılıklarında biyometrik akış sapmaları.

## Stabilizasyon Backlog ve Sprint Planı
### Sprint 1 — P0 Runtime Stabilizasyonu
1. Native OAuth callback standardizasyonu (`easytvhub://auth/callback` + `appUrlOpen` işleme).
2. iOS public bundle drift fix (`www` hash == `ios public` hash).
3. Auth fallback akışında callback sonrası session retry doğrulaması.

DoD:
- Kod değişikliği: tamam.
- Test senaryosu: callback URL ile login dönüşü en az 3 tekrar.
- Kabul kriteri: login sonrası her seferinde doğru ekrana iniş.

### Sprint 2 — P1 Ödeme ve Native Kontrat
1. `EasyTVPayments` Capacitor plugin implementasyonu (purchase/restore/status).
2. Payment error contract’ının native tarafından aynı kodlarla dönülmesi.
3. IAP receipt verification backend hattı.

DoD:
- Kod değişikliği: plugin + JS contract uyumu.
- Test senaryosu: purchase success/fail/restore/no-purchase.
- Kabul kriteri: UI’da tüm sonuçlar deterministic hata kodlarıyla görülür.

### Sprint 3 — Regresyon, Sertleştirme, Release
1. Auth + PIN + biometric + payment regresyon seti.
2. Release checklist ve preflight script (`cap copy`, hash, config gate).
3. Store öncesi smoke run dokümantasyonu.

DoD:
- Kod değişikliği: preflight script/checklist.
- Test senaryosu: cold/warm start + deeplink + restore.
- Kabul kriteri: checklist maddeleri %100 geçmeden release yok.

## Test Planı (Uygulanacak)
1. Cold start + warm start session restore.
2. Google OAuth roundtrip (başlat, callback al, doğru ekran).
3. Apple OAuth roundtrip (aynı zincir).
4. PIN + autolock + biyometrik fallback.
5. Premium activate/restore bridge senaryoları.
6. `npx cap copy` sonrası iOS public hash doğrulaması.
7. Regresyon: referans snapshot davranışıyla karşılaştırma.

## Bu Çalışmada Uygulanan Teknik Düzeltmeler
1. Native OAuth redirect URL standardizasyonu: `easytvhub://auth/callback`.
2. Capacitor `App` plugin `appUrlOpen` listener eklendi; callback URL’den session işleme aktive edildi.
3. `Info.plist` içine URL scheme (`easytvhub`) eklendi.
4. Payment service hata çıktıları standartlaştırıldı (`ok/source/code/message`).
5. `www` -> `ios/App/App/public` tekrar senkronlandı (`npx cap copy`).
