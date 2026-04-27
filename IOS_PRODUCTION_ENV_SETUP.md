# EasyTV iOS Production Env Setup

Bu dokuman, EasyTV iOS surumunu gercek cihaz ve TestFlight icin ayaga kaldirmak uzere gerekli production ayarlarini tek yerde toplar.

## 1. Kodun Bekledigi Production Noktalari

Uygulama su production degerlerine dayanir:

- Supabase publishable key ve project URL
- Supabase redirect allow-list
- iOS IAP verify Edge Function
- Apple App Store Server API JWT env degerleri
- Account delete Edge Function

Referans kod:

- [app.js](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/app.js)
- [payment-service.js](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/payment-service.js)
- [EasyTVPaymentsPlugin.swift](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App/EasyTVPaymentsPlugin.swift)
- [verify-ios-subscription/index.ts](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/supabase/functions/verify-ios-subscription/index.ts)
- [delete-account/index.ts](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/supabase/functions/delete-account/index.ts)

## 2. Supabase Production Setup

App tarafinda su degerler kullaniliyor:

- `SUPABASE_URL`
- `SUPABASE_KEY`

Kodda su an sabit:

- `SUPABASE_URL = https://susshevhyrylxrxesngc.supabase.co`
- `SUPABASE_KEY = sb_publishable_...`

Kontrol listesi:

- Bu proje gercek production Supabase projesine baglaniyor mu kontrol et.
- `auth.users` acik ve aktif olmali.
- `easytv_user_data` tablosu production'da kurulmus olmali.
- RLS policy'ler production veritabaninda aktif olmali:
  - [supabase_setup.sql](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/supabase_setup.sql)

## 3. Redirect URL Setup

OAuth akisi iOS'ta custom scheme ile donuyor:

- `easytvhub://auth/callback`

Kontrol et:

- Supabase Auth > URL Configuration icinde bu redirect allow-list'te olsun.
- Apple ve Google provider config'leri bu akisi bozmayacak sekilde guncel olsun.
- iOS host tarafinda URL scheme tanimli:
  - [Info.plist](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App/Info.plist)

## 4. IAP Verify Endpoint

App default olarak bu endpoint'i kullanir:

- `${SUPABASE_URL}/functions/v1/verify-ios-subscription`

App icindeki secim sirasi:

1. `SETTINGS.iapVerifyEndpoint`
2. `window.EASYTV_IAP_VERIFY_ENDPOINT`
3. default Supabase function URL

Pratik onerim:

- Production'da default Supabase function URL kalsin.
- Ayrica hard override gerekiyorsa `window.EASYTV_IAP_VERIFY_ENDPOINT` kullan.

## 5. Supabase Edge Function Env'leri

`verify-ios-subscription` function'i su env'leri ister:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APPLE_IAP_ISSUER_ID`
- `APPLE_IAP_KEY_ID`
- `APPLE_IAP_PRIVATE_KEY`
- `APPLE_IAP_BUNDLE_ID`
- opsiyonel: `APPLE_IAP_ENV`

Anlamlari:

- `SUPABASE_URL`
  - production Supabase project URL
- `SUPABASE_ANON_KEY`
  - production anon key
- `SUPABASE_SERVICE_ROLE_KEY`
  - sadece Edge Function secret olarak tanimli olmali; client koduna konmaz
- `APPLE_IAP_ISSUER_ID`
  - App Store Connect API issuer ID
- `APPLE_IAP_KEY_ID`
  - App Store Connect API key ID
- `APPLE_IAP_PRIVATE_KEY`
  - `.p8` private key icerigi
- `APPLE_IAP_BUNDLE_ID`
  - `com.easytvhub.app`
- `APPLE_IAP_ENV`
  - `production` veya gecici olarak `sandbox`

Production icin tavsiye:

- TestFlight asamasinda:
  - `APPLE_IAP_ENV=sandbox` ile basla
- Live release oncesi:
  - `APPLE_IAP_ENV=production`

## 6. Apple Tarafi Hazirlik

Apple Developer / App Store Connect tarafinda bunlar hazir olmali:

- App kaydi
- Bundle ID:
  - `com.easytvhub.app`
- In-App Purchase urunleri:
  - `easytv.premium.monthly`
  - `easytv.premium.yearly`
- App Store Connect API key
- Issuer ID
- Key ID
- Private key `.p8`

Native plugin bu product ID'leri bekliyor:

- [EasyTVPaymentsPlugin.swift](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App/EasyTVPaymentsPlugin.swift)

## 7. Account Delete Endpoint

App hesap silerken default olarak bu endpoint'i cagirir:

- `${SUPABASE_URL}/functions/v1/delete-account`

Override gerekiyorsa:

- `SETTINGS.accountDeleteEndpoint`
- veya `window.EASYTV_DELETE_ACCOUNT_ENDPOINT`

Bu function:

- login session bearer token'ini dogrular
- `easytv_user_data` kaydini server-side siler
- Supabase Auth kullanicisini service role ile siler

Deploy etmeden once `SUPABASE_SERVICE_ROLE_KEY` secret'i eklenmis olmali.

## 8. Xcode / Native Config

Kontrol et:

- Bundle ID:
  - `com.easytvhub.app`
- Version:
  - `MARKETING_VERSION = 1.0`
- Build:
  - `CURRENT_PROJECT_VERSION = 1`
- Deployment target:
  - `18.0`

Referans:

- [project.pbxproj](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App.xcodeproj/project.pbxproj)

## 9. En Hızlı Kurulum Sirasi

1. Production Supabase project'ini dogrula
2. `supabase_setup.sql` production'da calissin
3. Redirect allow-list'e `easytvhub://auth/callback` ekle
4. Apple IAP urunlerini App Store Connect'te dogrula
5. `verify-ios-subscription` ve `delete-account` function env'lerini tanimla
6. Function'lari deploy et
7. `npm run build`
8. `npm run ios:sync`
9. Gercek cihazda OAuth + IAP smoke yap

## 10. Minimum Basari Kriteri

Production env hazir sayilir eger:

- Supabase login iOS cihazda calisiyorsa
- verify function 401 yerine dogru auth ile cevap verebiliyorsa
- delete-account function girisli kullaniciyi ve cloud verisini silebiliyorsa
- TestFlight sandbox purchase transaction verify edilebiliyorsa
- Restore purchases akisi verify endpoint ile premium state yazabiliyorsa
