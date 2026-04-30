# EasyTV Mobile Preview

Bu repo icin iki pratik test yolu var.

## 1. Bilgisayarda Telefon Arayuzu

```bash
npm run preview:phone
```

Sonra acilan sayfa:

```text
http://localhost:3000/preview
```

Bu sayfa EasyTV'yi masaustunde telefon cercevesi icinde gosterir.

## 2. Gercek Telefonda Wi-Fi Uzerinden Test

```bash
npm run preview:mobile
```

Terminalde su formda bir adres gorunur:

```text
http://192.168.x.x:3000
```

Telefon ayni Wi-Fi agindayken bu adresi Safari veya Chrome'da ac.

## Sorun Giderme

- Telefon sayfayi acamiyorsa bilgisayar ve telefon ayni Wi-Fi aginda mi kontrol et.
- Windows Firewall portu engelliyorsa izin ver veya farkli port dene:

```bash
$env:PREVIEW_PORT=4173; npm run preview:mobile
```

- Sadece build almadan mevcut `www` klasorunu servis etmek icin:

```bash
node scripts/mobile-preview.js --no-build
```

## Daha Gercek Native Test

Capacitor live reload ile native WebView icinde test etmek icin cihaz ayni Wi-Fi'da olmali ve dev server LAN IP uzerinden erisilebilir olmali. Bu repo Windows uzerinde oldugu icin iOS native run icin yine macOS/Xcode gerekir; ama web UI ve PWA davranisi icin yukaridaki preview en hizli yoldur.
