# EasyTV iOS Today Execution

Bu liste, bugun yapilacak minimum yuksek etkili adimlari siralar. Amac, EasyTV'yi TestFlight'a yaklastirmaktir.

## Hedef

Bugunun hedefi:

- production env ve secret bosluklarini kapatmak
- gercek iOS testlerini baslatmak
- archive oncesi blocker'lari netlestirmek

## Bugun Yapilacaklar

1. Supabase production proje bilgilerini netlestir
- Canli `SUPABASE_URL`
- Canli `SUPABASE_ANON_KEY`
- Canli `SUPABASE_SERVICE_ROLE_KEY` secret olarak eklensin
- Redirect allow list icinde `easytvhub://auth/callback`

2. Apple IAP secretlarini hazirla
- `APPLE_IAP_ISSUER_ID`
- `APPLE_IAP_KEY_ID`
- `APPLE_IAP_PRIVATE_KEY`
- `APPLE_IAP_BUNDLE_ID`

3. Verify function deploy et
- Hedef function:
  - [verify-ios-subscription/index.ts](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/supabase/functions/verify-ios-subscription/index.ts)
- Hesap silme function:
  - [delete-account/index.ts](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/supabase/functions/delete-account/index.ts)
- Beklenen sonuc:
  - production env ile deploy edilmis ve token ile cagrilabilir

4. Web bundle'i iOS ile senkronla
- `npm run build`
- `npm run ios:sync`

5. Xcode signing kontrolu yap
- Team secili
- Bundle ID: `com.easytvhub.app`
- Automatic signing cozuluyor
- Device build alabiliyor

6. Gercek cihazda login smoke
- App acilsin
- Intro/login beklenen gibi gelsin
- Google login dene
- Apple login dene

7. Gercek cihazda premium smoke
- Aylik satin alma
- Yillik satin alma
- Restore purchases

8. Hesap silme smoke
- Girisli kullanicida ayarlardan hesap sil
- Auth user ve cloud veri temizleniyor mu kontrol et
- Login ekranina geri donus beklenen gibi mi bak

9. Archive dry run
- Xcode -> Product -> Archive
- Validate App
- Local build issue varsa not al

10. Bloklayanlari ayir
- Secret eksigi
- OAuth edge-case
- IAP edge-case
- Signing / profile hatasi

## Bitis Kriteri

Bugun basarili sayilir eger:

- verify function deploy edilmis ise
- en az bir gercek cihaz login testi gecmisse
- en az bir IAP veya restore testi denenmisse
- archive denemesi yapilmissa

## Hemen Sonraki Adim

Bu listenin ardindan:

- TestFlight upload
- internal tester smoke
- App Store Connect metadata + review notes
