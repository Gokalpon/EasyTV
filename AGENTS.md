# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# EasyTV Hub — Codex Bağlamı

## Proje Özeti
EasyTV Hub, streaming servis aboneliklerini (Netflix, Spotify, YouTube Premium vb.) yönetmek için mobil-first bir PWA (Progressive Web App). Telefon çerçevesi içinde çalışan tek sayfa HTML uygulaması. Tüm UI Türkçedir.

## Dosya Yapısı
```
index.html          — Ana HTML, tüm ekranlar (intro/login/onboard/pin/mainApp) burada
style.css           — Tüm stiller (animasyonlar, phone frame, ekranlar)
app.js              — Tüm uygulama mantığı ve Supabase entegrasyonu
error-handler.js    — Global JS hata yakalayıcı
premium-system.js   — Premium üyelik sistemi
dynamic-theme.js    — Dinamik tema/renk değişimi
search-feature.js   — Servis arama fonksiyonu
raleway-font.css    — Raleway font tanımı
akira-font.css      — Akira font tanımı
ubuntu-font.css     — Ubuntu font tanımı
assets/             — Servis logoları (PNG), EasyTV logosu
supabase_setup.sql  — Supabase tablo ve RLS kurulum SQL'i
vercel.json         — Vercel deployment ayarları
```

## Supabase Yapısı
**Tablo: `easytv_user_data`**
- `id` UUID PRIMARY KEY
- `user_id` UUID → auth.users(id)
- `services` JSONB DEFAULT `[]` — kullanıcının eklediği servisler dizisi
- `settings` JSONB DEFAULT `{}` — uygulama ayarları
- `profile` JSONB DEFAULT `{}` — kullanıcı profili
- `created_at`, `updated_at` TIMESTAMPTZ

**RLS:** Sadece kendi `user_id`'si için SELECT/INSERT/UPDATE/DELETE

## Auth Akışı
1. `initAuth()` çalışır (2s güvenlik timeout ile)
2. Supabase session yoksa → `introScreen` gösterilir
3. Session varsa → `onAuthSuccess(user)` çağrılır → `mainApp` gösterilir
4. Google OAuth destekleniyor (`loginWithGoogle()`)

## Ekranlar (index.html içinde)
- `#authLoading` — yükleniyor spinner
- `#introScreen` — giriş öncesi karşılama
- `#loginScreen` — email/şifre + Google ile giriş
- `#welcomeScreen` — ilk kayıt sonrası hoşgeldin
- `#onboardScreen` — onboarding
- `#pinScreen` — PIN ekranı
- `#mainApp` — ana uygulama (servis listesi, toplam maliyet vb.)

## Önemli Notlar
- Uygulama `.phone` CSS sınıfı içinde telefon çerçevesi olarak görüntülenir
- Font sistemi: **Space Grotesk** birincil font (tüm başlıklarda zorunlu)
- Animasyon token sistemi: spring motion (stiffness: 120, damping: 20)
- `CLOUD_SYNC_AVAILABLE` flag'i Supabase bağlantısı varsa `true` olur
- Supabase key `eyJ` ile başlamıyorsa cloud sync devre dışı kalır (offline mod)

## Bağımlılıklar
- `@supabase/supabase-js@2` — CDN üzerinden yüklenir
- Google Fonts: Space Grotesk, Inter, Syne, Playfair Display, Raleway

## Çalışma Stili — UI İterasyon Yöntemi
Kullanıcı localhost'a erişemez (Codex uzak sunucuda çalışır). UI değişikliklerini iteratif yaparken:
1. **Slider/tuner panel**: CSS değerlerini canlı ayarlamak için geçici bir floating panel ekle (`position:fixed`, sağ-alt köşe). Kullanıcı Vercel'den açar, slider'larla ayarlar, CSS'i kopyalar.
2. **Önce CSS'i göster**: Push etmeden önce değişikliği kullanıcıya yaz, onay bekle.
3. **Paneli kaldır**: Kullanıcı final değerleri onayladıktan sonra paneli index.html'den temizle.
- Tuner panel örneği: `<!-- BACKLIGHT TUNER — KALDIRILACAK -->` bloğu olarak işaretle.
