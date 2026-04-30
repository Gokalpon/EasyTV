# EasyTV iOS Release Checklist

Bu checklist, mevcut repo durumuna gore EasyTV'yi TestFlight ve App Store review'a tasimak icin kullanilir.

## 1. Preflight

- `main` branch temiz olsun.
- Web bundle guncel olsun:
  - `npm run build`
  - `npm run ios:sync`
- Preflight gate temiz gecsin:
  - `npm run release:preflight`
- iOS public bundle ile `www` ayni oldugundan emin ol.
- `CFBundleDisplayName`, `MARKETING_VERSION`, `CURRENT_PROJECT_VERSION` kontrol et:
  - [project.pbxproj](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App.xcodeproj/project.pbxproj)
- Bundle ID dogru olsun:
  - `com.easytvhub.app`
- Privacy manifest guncel olsun:
  - [PrivacyInfo.xcprivacy](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App/PrivacyInfo.xcprivacy)

## 2. Secrets ve Production Config

- Supabase production projesi aktif olsun.
- Su env/secretler tanimli olsun:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `APPLE_IAP_ISSUER_ID`
  - `APPLE_IAP_KEY_ID`
  - `APPLE_IAP_PRIVATE_KEY`
  - `APPLE_IAP_BUNDLE_ID`
- iOS subscription verify function deploy edilmis olsun:
  - [verify-ios-subscription/index.ts](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/supabase/functions/verify-ios-subscription/index.ts)
- Account delete function deploy edilmis olsun:
  - [delete-account/index.ts](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/supabase/functions/delete-account/index.ts)
- Supabase redirect allow-list icinde `easytvhub://auth/callback` bulunsun.

## 3. Native iOS Kontrolu

- URL scheme tanimli olsun:
  - [Info.plist](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App/Info.plist)
- Native IAP plugin projede register edilmis ve build'e giriyor olsun:
  - [EasyTVPaymentsPlugin.swift](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App/EasyTVPaymentsPlugin.swift)
- Xcode signing:
  - Team secili
  - Automatic signing dogru
  - App Store distribution profile cozuluyor

## 4. Zorunlu Cihaz Testleri

- Cold start
  - Uygulama aciliyor
  - Intro/login akisi beklenen gibi
- Existing session restore
  - Oturum varsa dogru ekrana iniyor
- Google OAuth
  - Baslat
  - Safari / auth donusu al
  - `easytvhub://auth/callback` ile app'e don
  - Kullanici oturumu acilsin
- Apple sign in
  - Ayni callback zinciri sorunsuz calissin
- PIN / biometric
  - PIN olusturma
  - PIN ile acma
  - Biyometrik fallback davranisi
- Premium purchase
  - Aylik satin alma
  - Yillik satin alma
  - Cancel / fail durumu
- Restore purchases
  - Restore calissin
  - UI deterministic sonuc gostersin
- Account deletion
  - Girisli kullanicida Auth user + cloud data + local cleanup dogru calissin
- Logout / login tekrar
  - Kullanici verisi karismasin

## 5. App Store Connect Hazirligi

- App name, subtitle, description, keywords girilmis olsun
- Privacy answers doldurulmus olsun
- Support URL ve privacy URL hazir olsun
- Screenshots hazir olsun:
  - En az iPhone boyutlari
- App icon App Store icin final olsun
- Subscription metadata hazir olsun:
  - Product titles
  - Pricing
  - Review screenshot gerekiyorsa ekle

## 6. Archive ve TestFlight

- Xcode -> Any iPhone Device
- Product -> Archive
- Organizer icinde archive ac
- Validate App
- Upload to App Store Connect
- TestFlight build processing tamamlaninca:
  - Internal tester ile smoke yap
  - OAuth
  - IAP
  - Restore
  - Delete account

## 7. Review Notes

- Reviewer'a kisa not birak:
  - Uygulama streaming subscription manager'dir
  - Premium ozellikler IAP ile acilir
  - OAuth callback custom URL scheme kullanir
  - Hesap silme uygulama icinden ayarlarda mevcuttur
- Gerekirse demo account ver:
  - Test email
  - Test sifre

## 8. Release Blockers

Su maddeler tamamlanmadan release cikmamalidir:

- Gercek cihazda OAuth roundtrip PASS degilse
- Purchase / restore PASS degilse
- Verify function production env ile calismiyorsa
- Delete account function production env ile calismiyorsa
- Privacy form kodla birebir eslesmiyorsa
- `www` ve iOS public bundle sync degilse

## 9. Bu Repo Icin Mevcut Durum

- Hazir:
  - Capacitor iOS host
  - OAuth callback scheme
  - Privacy manifest
  - Native IAP plugin
  - Supabase verification function
  - Supabase delete-account function
- Kalan:
  - Production secrets baglama
  - Gercek cihaz regression
  - TestFlight upload
  - App Store Connect submission
