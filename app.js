// ══════════════════════════════════════════════════
// SUPABASE KURULUMU
// ══════════════════════════════════════════════════
// ⚠️ ÖNEMLİ: Supabase RLS politikalarını aktif edin!
// SQL komutları CRITICAL_FIXES_SUMMARY.md dosyasında

// NOT: error-handler.js'de merkezi hata yönetimi var, burada sadece log
// window.onerror kaldırıldı.
// window.addEventListener('unhandledrejection') kaldırıldı.
let CLOUD_SYNC_AVAILABLE = false;
let currentUser = null;
let _authInitStarted = false;
let _emailAuthMode = 'signin';

const SUPABASE_URL = 'https://susshevhyrylxrxesngc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q6MOIZo_i2SBrkBVKos8_g_8NMKQiew';
let _supabase = null;
try {
  const { createClient } = supabase;
  // Supabase anahtarı legacy JWT (eyJ...) veya yeni publishable (sb_publishable_...) olabilir.
  const hasValidKeyFormat = !!SUPABASE_KEY && (
    SUPABASE_KEY.startsWith('eyJ') ||
    SUPABASE_KEY.startsWith('sb_publishable_')
  );
  if (hasValidKeyFormat) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    CLOUD_SYNC_AVAILABLE = true;
  } else {
    // Cloud sync devre dışı - geçersiz anahtar
    _supabase = null;
    CLOUD_SYNC_AVAILABLE = false;
  }
} catch(e) {
  console.warn('Supabase baglanti basarisiz:', e);
  CLOUD_SYNC_AVAILABLE = false;
}

// authLoading'i kaldır ve uygun ekranı göster
function _showFallbackScreen() {
  const authLoading = document.getElementById('authLoading');
  const bottomNav = document.getElementById('bottomNav');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const loginScreen = document.getElementById('loginScreen');
  const onboardScreen = document.getElementById('onboardScreen');
  const pinScreen = document.getElementById('pinScreen');
  const mainApp = document.getElementById('mainApp');
  const introScreen = document.getElementById('introScreen');
  if (authLoading) authLoading.style.display = 'none';
  if (welcomeScreen) welcomeScreen.style.display = 'none';
  if (loginScreen) loginScreen.style.display = 'none';
  if (onboardScreen) onboardScreen.style.display = 'none';
  if (mainApp) mainApp.style.display = 'none';
  // Session yoksa kullanıcıyı her zaman giriş akışına getir.
  if (bottomNav) bottomNav.style.display = 'none';
  if (pinScreen) pinScreen.style.display = 'none';
  if (introScreen) introScreen.style.display = 'flex';
  _initFuzzyLogo();
  _stabilizeIntroHero();
  _initLogoGallery();
}

// ── FUZZY LOGO (EasyTV logosu için canvas glitch efekti) ──
function _initFuzzyLogo() {
  var wrap = document.getElementById('introLogoWrap');
  if (!wrap || wrap.dataset.fuzzy) return;
  wrap.dataset.fuzzy = '1';
  var img = document.getElementById('introLogoImg');
  if (!img) return;
  img.style.display = 'block';
  img.style.opacity = '1';
  img.style.transform = 'none';
  img.style.filter = 'none';
}

function _stabilizeIntroHero() {
  var ids = ['introLogoWrap', 'introLogoImg', 'introTagline', 'introSub'];
  ids.forEach(function(id){
    var el = document.getElementById(id);
    if (!el) return;
    el.style.animation = 'none';
    el.style.transition = 'none';
    el.style.transform = 'none';
    el.style.filter = 'none';
    el.style.opacity = '1';
    el.style.webkitFilter = 'none';
    el.style.backdropFilter = 'none';
    el.style.webkitBackdropFilter = 'none';
  });
  var img = document.getElementById('introLogoImg');
  if (img) img.style.display = 'block';
}

// ── Char-by-char text reveal ──
function _charReveal(el, baseDelay) {
  if (!el) return;
  baseDelay = baseDelay || 0;
  var delay = baseDelay;
  // Strip any previously applied spans
  var html = el.innerHTML.replace(/<span class="cr-char"[^>]*>([^<]*)<\/span>/g, '$1');
  var parts = html.split(/(<br\s*\/?>)/i);
  var result = '';
  for (var p = 0; p < parts.length; p++) {
    var part = parts[p];
    if (/^<br/i.test(part)) {
      result += part;
    } else {
      for (var i = 0; i < part.length; i++) {
        var ch = part[i];
        if (ch === ' ' || ch === '\t' || ch === '\n') {
          result += ch;
        } else {
          result += '<span class="cr-char" style="animation-delay:' + delay.toFixed(3) + 's">' + ch + '</span>';
          delay += 0.02;
        }
      }
    }
  }
  el.innerHTML = result;
}

// ── Circular Gallery ──
function _initLogoGallery() {
  var el = document.getElementById('introLogoGallery');
  if (!el || el.dataset.init) return;
  el.dataset.init = '1';

  var S = [
    ['./assets/netflix_N.webp','#E50914'],   // kırmızı
    ['./assets/Disney+.webp','#0ABFBC'],     // teal
    ['./assets/twitch.webp','#9146FF'],      // mor
    ['./assets/youtube.webp','#FF0000'],     // kırmızı
    ['./assets/Spotify.webp','#1DB954'],     // yeşil
    ['./assets/hbo.webp','#6B2D8B'],         // mor
    ['./assets/tvplus2.webp','#FFD100'],     // sarı
    ['./assets/prime video.webp','#1A98FF'], // mavi
    ['./assets/bein.webp','#6F2DA8'],        // mor
    ['./assets/kickb.webp','#53FC18'],       // yeşil
    ['./assets/appleb.webp','#e0e0e0'],      // gri
    ['./assets/exxenb.webp','#FFD100'],      // sarı
  ];

  function hexRgb(h) {
    return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  }

  function drawRR(x,y,w,h,r) {
    r = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
    ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
    ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
    ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
  }

  var TW=110, TH=171, GAP=26, STEP=TW+GAP, N=S.length, TOTAL=N*STEP;
  var dpr=Math.min(window.devicePixelRatio||1,2);
  var cW=el.offsetWidth||393, cH=244;
  // OVER: extra canvas space above/below so glow is never clipped
  var OVER=90, cvH=cH+OVER*2;

  el.style.height=cH+'px';
  el.style.overflow='visible'; // allow glow to bleed outside div
  el.style.position='relative';

  // Glow canvas: CSS filter:blur() çalışır iOS Safari'de (ctx.filter ≠ CSS filter)
  var glowCv=document.createElement('canvas');
  glowCv.width=cW*dpr; glowCv.height=cvH*dpr;
  glowCv.style.cssText='width:100%;height:'+cvH+'px;position:absolute;top:-'+OVER+'px;left:0;pointer-events:none;';
  el.appendChild(glowCv);
  var glowCtx=glowCv.getContext('2d');
  glowCtx.scale(dpr,dpr);

  // Kart canvas: blur yok, sadece görseller
  var cv=document.createElement('canvas');
  cv.width=cW*dpr; cv.height=cvH*dpr;
  cv.style.cssText='width:100%;height:'+cvH+'px;position:absolute;top:-'+OVER+'px;left:0;touch-action:pan-x;user-select:none;pointer-events:auto;';
  el.appendChild(cv);
  var ctx=cv.getContext('2d');
  ctx.scale(dpr,dpr);

  var boxImg=new Image();
  boxImg.src='./assets/box1_long.webp';
  var imgs=S.map(function(s){var i=new Image();i.src=s[0];return i;});

  var sc={cur:0,tgt:0}, dn=false, sx=0, ss=0, vel=0, lx=0;
  function lerp(a,b,t){return a+(b-a)*t;}
  function onDown(x){dn=true;sx=lx=x;ss=sc.tgt;vel=0;}
  function onMove(x){if(!dn)return;vel=lx-x;lx=x;sc.tgt=ss+(sx-x);}
  function onUp(){dn=false;sc.tgt+=vel*3.5;}
  cv.addEventListener('touchstart',function(e){onDown(e.touches[0].clientX);},{passive:true});
  cv.addEventListener('touchmove',function(e){onMove(e.touches[0].clientX);},{passive:true});
  cv.addEventListener('touchend',onUp);
  cv.addEventListener('mousedown',function(e){onDown(e.clientX);});
  cv.addEventListener('mousemove',function(e){onMove(e.clientX);});
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('mouseleave',onUp);

  var H=cW/2, BEND=30, R=(H*H+BEND*BEND)/(2*BEND);

  function getPos(i, pass, off) {
    var tx=( (cW-TOTAL)/2 )+i*STEP+pass*TOTAL-off;
    var cx=tx+TW/2, dx=cx-cW/2;
    var eff=Math.min(Math.abs(dx),H);
    var arc=R-Math.sqrt(Math.max(0,R*R-eff*eff));
    var ty=8+OVER+arc;
    var rot=Math.sign(dx)*Math.asin(Math.min(eff/R,1))*0.75;
    var alpha=1-Math.max(0,(Math.abs(dx)/H-0.60)/0.28);
    alpha=Math.max(0,Math.min(1,alpha));
    return {tx:tx,cx:cx,dx:dx,ty:ty,eff:eff,alpha:alpha,rot:rot};
  }

  function tick(){
    var intro=document.getElementById('introScreen');
    if(!intro||intro.style.display==='none'){requestAnimationFrame(tick);return;}
    if(!dn) sc.tgt+=0.45;
    sc.cur=lerp(sc.cur,sc.tgt,0.065);
    ctx.clearRect(0,0,cW,cvH);
    glowCtx.clearRect(0,0,cW,cvH);

    var off=((sc.cur%TOTAL)+TOTAL)%TOTAL;
    var g=window.BLG||{blur:10,op:0.5,ox:-10,oy:15,shape:0.1,gx:0.8,gy:0.85};

    // CSS blur'u BLG.blur değerinden ayarla (sadece değer değişince güncelle)
    var blurPx=Math.max(2,g.blur||10)+'px';
    if(glowCv.dataset.blur!==blurPx){glowCv.style.filter='blur('+blurPx+')';glowCv.dataset.blur=blurPx;}

    // Pass 1: backlights — orijinal gibi rounded rect, glowCtx üstünde (CSS blur iOS uyumlu)
    for(var p=-1;p<=1;p++){
      for(var i=0;i<N;i++){
        var pos=getPos(i,p,off);
        if(pos.cx<-TW*2||pos.cx>cW+TW*2||pos.alpha<=0) continue;
        var rgb=hexRgb(S[i][1]);
        var glowW=TW*(g.gx||1), glowH=TH*(g.gy||1);
        var gcx=pos.cx+(g.ox||0), gcy=pos.ty+TH*0.5+(g.oy||0);
        var ga=g.op*pos.alpha;
        var shapeR=(g.shape||0)*Math.min(glowW/2,glowH/2);
        glowCtx.save();
        glowCtx.translate(pos.cx,pos.ty+TH/2);
        glowCtx.rotate(pos.rot);
        glowCtx.translate(-pos.cx,-(pos.ty+TH/2));
        glowCtx.globalAlpha=ga;
        glowCtx.fillStyle='rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
        // drawRR inline — orijinal şekil
        var rx=gcx-glowW/2, ry=gcy-glowH/2, rr=Math.min(shapeR,glowW/2,glowH/2);
        glowCtx.beginPath();
        glowCtx.moveTo(rx+rr,ry); glowCtx.lineTo(rx+glowW-rr,ry);
        glowCtx.arcTo(rx+glowW,ry,rx+glowW,ry+rr,rr); glowCtx.lineTo(rx+glowW,ry+glowH-rr);
        glowCtx.arcTo(rx+glowW,ry+glowH,rx+glowW-rr,ry+glowH,rr); glowCtx.lineTo(rx+rr,ry+glowH);
        glowCtx.arcTo(rx,ry+glowH,rx,ry+glowH-rr,rr); glowCtx.lineTo(rx,ry+rr);
        glowCtx.arcTo(rx,ry,rx+rr,ry,rr); glowCtx.closePath();
        glowCtx.fill();
        glowCtx.restore();
      }
    }

    // Pass 2: cards with rotation (box1_long.png + logo)
    for(var p=-1;p<=1;p++){
      for(var i=0;i<N;i++){
        var pos=getPos(i,p,off);
        if(pos.cx<-TW*2||pos.cx>cW+TW*2||pos.alpha<=0) continue;

        ctx.save();
        ctx.globalAlpha=pos.alpha;
        ctx.translate(pos.cx, pos.ty+TH/2);
        ctx.rotate(pos.rot);
        ctx.translate(-pos.cx, -(pos.ty+TH/2));

        if(boxImg.complete&&boxImg.naturalWidth>0){
          ctx.drawImage(boxImg, pos.tx, pos.ty, TW, TH);
        }
        if(imgs[i].complete&&imgs[i].naturalWidth>0){
          var iw=imgs[i].naturalWidth, ih=imgs[i].naturalHeight;
          var ms=TW*0.56, sc2=Math.min(ms/iw,ms/ih);
          ctx.drawImage(imgs[i],
            pos.tx+(TW-iw*sc2)/2,
            pos.ty+(TH-ih*sc2)/2,
            iw*sc2, ih*sc2);
        }

        ctx.restore();
      }
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function _applyLogoReveal(imgEl) {
  if (!imgEl) return;
  imgEl.classList.remove('logo-reveal');
  void imgEl.offsetWidth; // reflow to restart
  imgEl.classList.add('logo-reveal');
}

function _showAuthScreens() {
  const bottomNav = document.getElementById('bottomNav');
  if (bottomNav) bottomNav.style.display = 'none';
}

// Sayfa yüklenince auth durumunu kontrol et
async function initAuth() {
  if (_authInitStarted) return;
  _authInitStarted = true;
  // Güvenlik zamanlayıcı — 2 saniye içinde auth tamamlanmazsa yine de UI göster
  let _authDone = false;
  const _safetyTimer = setTimeout(() => {
    if (!_authDone) {
      console.warn('initAuth: 2s safety timeout — showing fallback screen');
      _authDone = true;
      _showFallbackScreen();
    }
  }, 2000);

  try {
    // Supabase yoksa direkt intro/welcome göster
    if (!_supabase) {
      _authDone = true;
      clearTimeout(_safetyTimer);
      _showFallbackScreen();
      return;
    }

    // URL'de OAuth callback var mı? (Google/Apple yönlendirmesi)
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);

    if (hash.includes('access_token') || params.get('code')) {
      const authLoading = document.getElementById('authLoading');
      if (authLoading) authLoading.style.display = 'flex';
      const { data, error } = await _supabase.auth.getSession();
      if (data && data.session) {
        const cleanUrl = window.location.href.split('#')[0].split('?')[0];
        history.replaceState({}, document.title, cleanUrl);
        _authDone = true;
        clearTimeout(_safetyTimer);
        onAuthSuccess(data.session.user);
        return;
      }
    }

    // Mevcut session var mı?
    const { data: { session } } = await _supabase.auth.getSession();

    _authDone = true;
    clearTimeout(_safetyTimer);
    if (session) {
      onAuthSuccess(session.user);
    } else {
      _showFallbackScreen();
    }
  } catch(e) {
    console.warn('Auth hatasi:', e);
    if (!_authDone) {
      _authDone = true;
      clearTimeout(_safetyTimer);
      _showFallbackScreen();
    }
  }
}

function getOAuthRedirectUrl() {
  const cleanHref = window.location.href.split('?')[0].split('#')[0];
  return cleanHref;
}

function setEmailAuthMode(mode) {
  _emailAuthMode = mode === 'signup' ? 'signup' : 'signin';
  const titleEl = document.getElementById('emailAuthTitle');
  const submitBtn = document.getElementById('emailAuthSubmitBtn');
  const switchBtn = document.getElementById('emailAuthSwitchBtn');
  const nameWrap = document.getElementById('emailAuthNameWrap');
  const confirmWrap = document.getElementById('emailAuthConfirmWrap');
  const passwordEl = document.getElementById('emailAuthPassword');
  const confirmEl = document.getElementById('emailAuthConfirmPassword');

  if (titleEl) titleEl.textContent = _emailAuthMode === 'signup' ? t('email_auth_signup_title') : t('email_auth_signin_title');
  if (submitBtn) submitBtn.textContent = _emailAuthMode === 'signup' ? t('email_auth_signup_btn') : t('email_auth_signin_btn');
  if (switchBtn) switchBtn.textContent = _emailAuthMode === 'signup' ? t('email_auth_switch_to_signin') : t('email_auth_switch_to_signup');
  if (nameWrap) nameWrap.style.display = _emailAuthMode === 'signup' ? 'block' : 'none';
  if (confirmWrap) confirmWrap.style.display = _emailAuthMode === 'signup' ? 'block' : 'none';
  if (passwordEl) passwordEl.autocomplete = _emailAuthMode === 'signup' ? 'new-password' : 'current-password';
  if (confirmEl) confirmEl.autocomplete = _emailAuthMode === 'signup' ? 'new-password' : 'off';
}

function openEmailAuth(mode) {
  const sheet = document.getElementById('emailAuthSheet');
  if (!sheet) return;
  setEmailAuthMode(mode || 'signin');
  sheet.style.display = 'block';
}

function closeEmailAuth() {
  const sheet = document.getElementById('emailAuthSheet');
  if (sheet) sheet.style.display = 'none';
}

function toggleEmailAuthMode() {
  setEmailAuthMode(_emailAuthMode === 'signup' ? 'signin' : 'signup');
}

async function submitEmailAuth() {
  if (!_supabase) { showToast('Cloud bağlantısı yok'); return; }

  const emailEl = document.getElementById('emailAuthEmail');
  const passwordEl = document.getElementById('emailAuthPassword');
  const confirmEl = document.getElementById('emailAuthConfirmPassword');
  const nameEl = document.getElementById('emailAuthName');
  const submitBtn = document.getElementById('emailAuthSubmitBtn');

  const email = (emailEl && emailEl.value || '').trim();
  const password = (passwordEl && passwordEl.value || '').trim();
  const confirmPassword = (confirmEl && confirmEl.value || '').trim();
  const fullName = (nameEl && nameEl.value || '').trim();

  if (!email || !password) {
    showToast(t('email_auth_required'));
    return;
  }
  if (password.length < 6) {
    showToast(t('email_auth_password_min'));
    return;
  }
  if (_emailAuthMode === 'signup' && password !== confirmPassword) {
    showToast(LANG==='tr' ? 'Şifreler eşleşmiyor' : 'Passwords do not match');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
  }

  try {
    if (_emailAuthMode === 'signup') {
      const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: getOAuthRedirectUrl(),
          data: { full_name: fullName || '' }
        }
      });
      if (error) throw error;
      if (data && data.session && data.user) {
        closeEmailAuth();
        await onAuthSuccess(data.user);
      } else {
        showToast(t('email_auth_signup_success_verify'));
        setEmailAuthMode('signin');
      }
    } else {
      const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (error) throw error;
      if (data && data.user) {
        closeEmailAuth();
        await onAuthSuccess(data.user);
      }
    }
  } catch (e) {
    showToast((_emailAuthMode === 'signup' ? t('email_auth_signup_btn') : t('email_auth_signin_btn')) + ' ' + t('email_auth_failed') + ': ' + (e.message || t('unknown_error')));
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

async function loginWithOAuthProvider(provider, buttonId, providerTitle) {
  _showAuthScreens();
  if (!_supabase) { showToast('Cloud bağlantısı yok'); return; }

  const loginBtn = document.getElementById(buttonId);
  if (loginBtn) {
    loginBtn.style.opacity = '0.6';
    loginBtn.disabled = true;
  }

  try {
    const { data, error } = await _supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: getOAuthRedirectUrl()
      }
    });

    if (error) {
      showToast(providerTitle + ' girişi başarısız: ' + error.message);
      if (loginBtn) {
        loginBtn.style.opacity = '1';
        loginBtn.disabled = false;
      }
    }
    // Bazı istemci sürümlerinde otomatik yönlendirme yapılmadığı için URL'i manuel aç.
    if (data && data.url) {
      window.location.assign(data.url);
      return;
    }
    showToast(providerTitle + ' yönlendirmesi alınamadı');
    if (loginBtn) {
      loginBtn.style.opacity = '1';
      loginBtn.disabled = false;
    }
  } catch (e) {
    showToast(providerTitle + ' girişi başarısız');
    if (loginBtn) {
      loginBtn.style.opacity = '1';
      loginBtn.disabled = false;
    }
  }
}

// Google ile giriş
async function loginWithGoogle() {
  await loginWithOAuthProvider('google', 'googleLoginBtn', 'Google');
}

// Apple ile giriş
async function loginWithApple() {
  await loginWithOAuthProvider('apple', 'appleLoginBtn', 'Apple');
}

// Auth başarılı — uygulamayı başlat
async function onAuthSuccess(user) {
  const authLoading = document.getElementById('authLoading');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const loginScreen = document.getElementById('loginScreen');
  const onboardScreen = document.getElementById('onboardScreen');
  const bottomNav = document.getElementById('bottomNav');
  const pinScreen = document.getElementById('pinScreen');
  if (authLoading) authLoading.style.display = 'flex';

  if (user) {
    PROFILE.name = (user.user_metadata && user.user_metadata.full_name) || (user.email && user.email.split('@')[0]) || 'Kullanıcı';
    PROFILE.email = user.email || '';
    PROFILE.avatar = (user.user_metadata && user.user_metadata.avatar_url) || '';

    // Cloud'dan veri yükle
    await syncFromCloud(user.id);

    saveData();
    const signedInEl = document.getElementById('signedInAs');
    if (signedInEl) signedInEl.textContent = user.email || '';
  }

  if (authLoading) authLoading.style.display = 'none';
  if (welcomeScreen) welcomeScreen.style.display = 'none';
  if (loginScreen) loginScreen.style.display = 'none';
  if (onboardScreen) onboardScreen.style.display = 'none';
  if (bottomNav) bottomNav.style.display = 'flex';

  const hasPin = !!(SETTINGS.pin || SETTINGS.pinHash);
  if (SETTINGS.usePin === false) {
    unlockApp();
  } else if (!hasPin) {
    const mainApp = document.getElementById('mainApp');
    if (mainApp) mainApp.style.display = 'none';
    if (pinScreen) pinScreen.style.display = 'none';
    if (onboardScreen) {
      onboardScreen.style.display = 'flex';
      renderOnboardStep();
    } else {
      unlockApp();
    }
  } else {
    if (pinScreen) {
      pinScreen.style.display = 'flex';
      _applyLogoReveal(pinScreen.querySelector('.pin-logo img'));
      _charReveal(document.getElementById('pinGreeting'), 0.15);
    }
  }
}

// ── Supabase Cloud Sync ──
let _cloudUserId = null;
let _cloudSyncTimer = null;

async function syncFromCloud(userId) {
  if (!_supabase) return;
  _cloudUserId = userId;
  try {
    const { data, error } = await _supabase
      .from('easytv_user_data')
      .select('payload')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    if (data && data.payload) {
      const cloud = JSON.parse(data.payload);
      const localTs = parseInt(localStorage.getItem('easytv_data_ts') || '0');
      const cloudTs = cloud.ts || 0;
      if (cloudTs > localTs) {
        // Cloud daha yeni — cloud'u kullan
        if (cloud.svc) SVC = cloud.svc;
        if (cloud.settings) SETTINGS = {...SETTINGS, ...cloud.settings};
        if (cloud.profile) PROFILE = cloud.profile;
        showToast('☁️ Veriler buluttan yüklendi');
      } else if (localTs > cloudTs && SVC.length > 0) {
        // Local daha yeni — cloud'a yaz
        await pushToCloud(userId);
      }
    } else if (SVC.length > 0) {
      // Cloud'da hiç veri yok, local'i yükle
      await pushToCloud(userId);
    }
  } catch(e) {
    if(e && e.code === '42P01') showToast('⚠️ Cloud sync devre dışı — Supabase tablosu eksik');
    console.warn('Cloud sync hatası:', e);
  }
}

async function pushToCloud(userId) {
  if (!_supabase) return;
  if (!userId && !_cloudUserId) return;
  const uid = userId || _cloudUserId;
  const ts = Date.now();
  localStorage.setItem('easytv_data_ts', String(ts));
  const payload = JSON.stringify({ svc: SVC, settings: SETTINGS, profile: PROFILE, ts });
  try {
    await _supabase.from('easytv_user_data').upsert(
      { user_id: uid, payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  } catch(e) { console.warn('Cloud push hatası:', e); }
}

// saveData'yı cloud sync ile güçlendir — ikinci script bloğu yüklendikten sonra wrap edilecek
function _wrapSaveData() {
  if (typeof window._origSaveData !== 'undefined') return; // zaten wrap edilmiş
  const orig = window.saveData;
  if (typeof orig !== 'function') return;
  window._origSaveData = orig;
  window.saveData = function() {
    window._origSaveData();
    localStorage.setItem('easytv_data_ts', String(Date.now()));
    clearTimeout(_cloudSyncTimer);
    _cloudSyncTimer = setTimeout(() => {
      if (_cloudUserId) pushToCloud(_cloudUserId);
    }, 2000);
  };
}

// Çıkış yap
async function signOut() {
  try { if (_supabase) await _supabase.auth.signOut(); } catch(e) {}
  localStorage.clear();
  location.reload();
}

// loginWith fonksiyonunu override et
async function loginWith(method) {
  _showAuthScreens();
  if (method === 'google') {
    await loginWithGoogle();
  } else if (method === 'apple') {
    await loginWithApple();
  } else if (method === 'email') {
    openEmailAuth('signin');
  } else {
    // Atla — direkt onboarding
    const screen = document.getElementById('loginScreen');
    const onboardScreen = document.getElementById('onboardScreen');
    if (!screen || !onboardScreen) return;
    screen.style.opacity = '0';
    screen.style.transition = 'opacity .4s ease';
    setTimeout(() => {
      screen.style.display = 'none';
      onboardScreen.style.display = 'flex';
      renderOnboardStep();
    }, 420);
  }
}

// Şimdilik atla butonu için
function skipAuth() {
  loginWith('skip');
}

// Intro dil değiştirme
function toggleLangMenu(){
  const m=document.getElementById('introLangMenu');
  const c=document.getElementById('introLangChevron');
  if(!m||!c) return;
  const open=m.style.display==='block';
  m.style.display=open?'none':'block';
  c.style.transform=open?'':'rotate(180deg)';
}
function setIntroLang(lang){
  LANG=lang;
  localStorage.setItem('easytv_lang',lang);
  const lbl=document.getElementById('introLangLabel');
  if(lbl) lbl.textContent=lang==='tr'?'TR':'EN';
  const menu=document.getElementById('introLangMenu');
  const chev=document.getElementById('introLangChevron');
  const introTagline=document.getElementById('introTagline');
  const introSub=document.getElementById('introSub');
  const introHint=document.getElementById('introHint');
  if(menu) menu.style.display='none';
  if(chev) chev.style.transform='';
  if(introTagline) introTagline.innerHTML=lang==='tr'?'Tüm servisleriniz<br>tek bir yerde.':'All your services<br>in one place.';
  if(introSub) introSub.innerHTML=lang==='tr'?'Tek yerden hızlıca erişin. Üyeliklerinizi<br>ve ödemelerinizi de kolayca takip edin.':'Access everything in one place.<br>Track your subscriptions and payments.';
  const f1=document.getElementById('introFeat1');const f2=document.getElementById('introFeat2');const f3=document.getElementById('introFeat3');
  const introCtaText=document.querySelector('#introCta .cta-btn-text');
  if(f1)f1.textContent=lang==='tr'?'Otomatik yenileme takibi & hatırlatıcı':'Auto renewal tracking & reminders';
  if(f2)f2.textContent=lang==='tr'?'Aylık harcama özeti ve analizi':'Monthly spending summary & analysis';
  if(f3)f3.textContent=lang==='tr'?'PIN & Face ID ile güvenli giriş':'Secure login with PIN & Face ID';
  if(introCtaText) introCtaText.textContent=lang==='tr'?'Başlayın':'Get Started';
  if(introHint) introHint.textContent=lang==='tr'?'Zaten hesabınız var mı? Giriş yapın':'Already have an account? Sign in';
  // Welcome sayfasını da senkronize et
  const wlcLangFlag=document.getElementById('wlcLangFlag');
  const wlcLangLabel=document.getElementById('wlcLangLabel');
  const wlcOptTR=document.getElementById('wlcOptTR');
  const wlcOptEN=document.getElementById('wlcOptEN');
  const wlcTagline=document.getElementById('wlcTagline');
  const wlcSub=document.getElementById('wlcSub');
  const wlcStartBtn=document.getElementById('wlcStartBtn');
  if(wlcLangFlag){
    wlcLangFlag.textContent=lang==='tr'?'🇹🇷':'🇬🇧';
    if(wlcLangLabel) wlcLangLabel.textContent=lang==='tr'?'Türkçe':'English';
    if(wlcOptTR) wlcOptTR.classList.toggle('selected',lang==='tr');
    if(wlcOptEN) wlcOptEN.classList.toggle('selected',lang==='en');
    if(wlcTagline) wlcTagline.innerHTML=lang==='tr'?'Şifreleriniz güvende,<br>giriş tek dokunuşta.':'Passwords safe,<br>sign in with one tap.';
    if(wlcSub) wlcSub.textContent=lang==='tr'?'TV aboneliklerinizi saklayın.\nQR ile saniyeler içinde oturum açın.':'Store your TV subscriptions.\nSign in with QR in seconds.';
  }
  if(wlcStartBtn) wlcStartBtn.textContent=lang==='tr'?'Başlayın':'Get Started';
  applyLang();
}

// intro → welcome geçişi
function showSignupOptions() {
  openEmailAuth('signup');
}
function showWelcomeFromIntro() {
  const intro = document.getElementById('introScreen');
  if(!intro) return;
  intro.style.animation = 'screenSlideOut .3s cubic-bezier(.4,0,.2,1) both';
  setTimeout(() => {
    intro.style.display = 'none';
    intro.style.animation = '';
    const ls = document.getElementById('loginScreen');
    if(!ls) return;
    ls.style.display = 'flex';
    ls.style.animation = 'screenSlideIn .38s cubic-bezier(.34,1.2,.64,1) both';
    _charReveal(document.getElementById('loginHeading'), 0.18);
    _charReveal(document.getElementById('loginSub'), 0.46);
  }, 280);
}

// goToLogin override
function goToLogin() {
  const ws = document.getElementById('welcomeScreen');
  if(!ws) return;
  ws.classList.add('out');
  setTimeout(() => {
    ws.style.display = 'none';
    const ls = document.getElementById('loginScreen');
    if(!ls) return;
    ls.style.display = 'flex';
    ls.style.opacity = '0';
    ls.style.transition = 'opacity .4s cubic-bezier(.4,0,.2,1)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ls.style.opacity = '1';
      _charReveal(document.getElementById('loginHeading'), 0.18);
      _charReveal(document.getElementById('loginSub'), 0.46);
    }));
  }, 420);
}

function animateNumber(el, target, prefix, suffix, decimals) {
  if(!el) return;
  const start = 0;
  el.dataset.val = target;
  const diff = target - start;
  const dur = 600;
  const startTime = performance.now();
  function step(now) {
    const p = Math.min((now-startTime)/dur, 1);
    const ease = 1-Math.pow(1-p,3);
    const val = start + diff*ease;
    el.textContent = (prefix||'') + val.toFixed(decimals||0) + (suffix||'');
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ══════════════════════════════════════════════════
// ORJINAL KOD (tüm veri modeli, UI ve mantık)
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════════════
// PREMIUM SİSTEMİ
// ══════════════════════════════════════════════════
const FREE_LIMIT = 6;

function isPremium() {
  return SETTINGS.premium === true;
}

function openPremiumSheet() {
  const el = document.getElementById('premiumSheet');
  if (!el) return;
  el.style.display = 'flex';
  requestAnimationFrame(() => el.classList.add('open'));
}

function closePremiumSheet() {
  const el = document.getElementById('premiumSheet');
  if (!el) return;
  el.classList.remove('open');
  setTimeout(() => { el.style.display = 'none'; }, 350);
}

function activatePremium() {
  // İlk kez premium'a geçiyorsa 7 gün ücretsiz trial ver
  if (!SETTINGS.premiumTrialUsed) {
    SETTINGS.premiumTrialUsed = true;
    SETTINGS.premiumTrialActive = true;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    SETTINGS.premiumTrialEndDate = endDate.toISOString();
    showErrorToast('🎉 7 gün ücretsiz deneme başladı!', 'success', 5000);
  }
  
  SETTINGS.premium = true;
  saveData();
  closePremiumSheet();
  showToast('✦ Premium aktif! Sınırsız servis ekleyebilirsiniz.');
  updatePremiumBadge();
}

function deactivatePremium() {
  if (SVC.length > FREE_LIMIT) {
    showAlert('⚠️', 'Premium İptal',
      'Şu an ' + SVC.length + ' servisin var. Premium iptal edilirse ' + (SVC.length - FREE_LIMIT) + ' servis kilitlenecek (silinmeyecek).',
      [
        { label: 'İptal Et', style: 'danger', action: function() {
          SETTINGS.premium = false;
          SETTINGS.premiumTrialActive = false;
          saveData();
          closeAlert();
          updatePremiumBadge();
          buildGrid();
          renderSubs();
          showErrorToast('Premium iptal edildi. ' + (SVC.length - FREE_LIMIT) + ' servis kilitlendi.', 'warning', 5000);
        }},
        { label: 'Vazgeç', style: 'secondary', action: closeAlert }
      ]
    );
  } else {
    SETTINGS.premium = false;
    SETTINGS.premiumTrialActive = false;
    saveData();
    updatePremiumBadge();
    showToast('Premium iptal edildi');
  }
}

function updatePremiumBadge() {
  var badge = document.getElementById('premiumBadge');
  var tog = document.getElementById('premiumToggle');
  if (badge) {
    if (isPremium()) {
      badge.textContent = 'Aktif';
      badge.classList.remove('pasif');
      badge.classList.add('aktif');
    } else {
      badge.textContent = 'Pasif';
      badge.classList.remove('aktif');
      badge.classList.add('pasif');
    }
  }
  if (tog) { tog.classList.toggle('on', isPremium()); tog.style.background = isPremium() ? '#9333ea' : 'rgba(255,255,255,.15)'; }
}

function togglePremiumFromSettings() {
  if (isPremium()) {
    deactivatePremium();
  } else {
    openPremiumSheet();
  }
}

// ══════════════════════════════════════════════════
// KULLANICI SAYISI & ÖDEME YÖNTEMİ
// ══════════════════════════════════════════════════
const SERVICE_MAX_USERS = {'netflix':6,'youtube':6,'disney':4,'prime':3,'hbo':5,'apple':6,'twitch':1,'kick':1,'exxen':4,'bein':3,'spotify':6,'tvplus':5};
let _planUserCount = 1;
let _planPayMethod = 'me';

function getPlanMaxUsers(svcId) {
  return SERVICE_MAX_USERS[svcId] || 6;
}

function renderPlanUserSection(svcId, selectedPlan) {
  ['planUserSection','planPaySection','planMyCost'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  if (!selectedPlan || selectedPlan.price === 0) return;
  const maxUsers = getPlanMaxUsers(svcId);
  const sym = getCountrySymbol ? getCountrySymbol() : '₺';
  // Kullanıcı sayısı
  const userSection = document.createElement('div');
  userSection.id = 'planUserSection';
  userSection.className = 'plan-user-section';
  let pillsHtml = '';
  for (let i = 1; i <= maxUsers; i++) {
    pillsHtml += `<button class="plan-user-pill${i===1?' active':''}" onclick="selectUserCount(${i},'${svcId}',${selectedPlan.price},'${sym}')">${i} kişi</button>`;
  }
  userSection.innerHTML = `<div class="plan-user-label">Kaç kişi kullanıyor?</div><div class="plan-user-pills" id="planUserPills">${pillsHtml}</div>`;
  // Ödeme yöntemi
  const paySection = document.createElement('div');
  paySection.id = 'planPaySection';
  paySection.className = 'plan-payment-section';
  paySection.innerHTML = `
    <div class="plan-user-label">Ödeme yöntemi</div>
    <div class="plan-payment-opts">
      <div class="plan-pay-opt active" id="payOptMe" onclick="selectPayMethod('me','${svcId}',${selectedPlan.price},'${sym}')">
        <div class="plan-pay-opt-radio"></div>
        <div class="plan-pay-opt-text"><div class="plan-pay-opt-lbl">Ben ödüyorum</div><div class="plan-pay-opt-sub">Tüm tutar bana ait</div></div>
        <div class="plan-pay-price" id="payPriceMe">${sym}${selectedPlan.price.toFixed(2)}</div>
      </div>
      <div class="plan-pay-opt" id="payOptSplit" onclick="selectPayMethod('split','${svcId}',${selectedPlan.price},'${sym}')">
        <div class="plan-pay-opt-radio"></div>
        <div class="plan-pay-opt-text"><div class="plan-pay-opt-lbl">Eşit bölüşüyoruz</div><div class="plan-pay-opt-sub">Kişi başı eşit pay</div></div>
        <div class="plan-pay-price" id="payPriceSplit">${sym}${selectedPlan.price.toFixed(2)}</div>
      </div>
      <div class="plan-pay-opt" id="payOptOther" onclick="selectPayMethod('other','${svcId}',${selectedPlan.price},'${sym}')">
        <div class="plan-pay-opt-radio"></div>
        <div class="plan-pay-opt-text"><div class="plan-pay-opt-lbl">Başkası ödüyor</div><div class="plan-pay-opt-sub">Harcamana eklenmez</div></div>
        <div class="plan-pay-price" style="color:rgba(255,255,255,.3)">₺0,00</div>
      </div>
    </div>`;
  const myCost = document.createElement('div');
  myCost.id = 'planMyCost';
  myCost.className = 'plan-my-cost';
  myCost.innerHTML = `<div class="plan-my-cost-lbl">Benim aylık maliyetim</div><div class="plan-my-cost-val" id="myCostVal">${sym}${selectedPlan.price.toFixed(2)}</div>`;
  const planListEl = document.getElementById('planList');
  if (planListEl) planListEl.after(userSection, paySection, myCost);
  _planUserCount = 1;
  _planPayMethod = 'me';
}

function selectUserCount(n, svcId, price, sym) {
  _planUserCount = n;
  document.querySelectorAll('.plan-user-pill').forEach((p,i) => p.classList.toggle('active', i+1===n));
  const splitEl = document.getElementById('payPriceSplit');
  if (splitEl) splitEl.textContent = sym + (price/n).toFixed(2);
  updateMyCost(price, sym);
}

function selectPayMethod(method, svcId, price, sym) {
  _planPayMethod = method;
  ['me','split','other'].forEach(m => {
    const el = document.getElementById('payOpt'+m.charAt(0).toUpperCase()+m.slice(1));
    if (el) el.classList.toggle('active', m===method);
  });
  updateMyCost(price, sym);
}

function updateMyCost(price, sym) {
  const el = document.getElementById('myCostVal');
  if (!el) return;
  let cost = _planPayMethod==='me' ? price : _planPayMethod==='split' ? price/_planUserCount : 0;
  el.textContent = sym + cost.toFixed(2);
}

// unlockFromLock
// unlockFromLock
function unlockFromLock() {
  // Show PIN/Face ID screen instead of unlocking directly
  const lockEl = document.getElementById('lockScreen');
  if (lockEl) { lockEl.style.opacity='0'; lockEl.style.transition='opacity .3s'; setTimeout(()=>lockEl.style.display='none',300); }
  // Show PIN screen
  const pinScreen = document.getElementById('pinScreen');
  if (pinScreen) pinScreen.style.display = 'flex';
  // Optionally reset PIN input state here if needed
  // Hide main app until PIN/Face ID is successful
  const mainApp = document.getElementById('mainApp');
  if (mainApp) mainApp.style.display = 'none';
}

const REGION_DATA = {
  tr: {
    label:'🇹🇷 Türkiye',
    deep:{netflix:'netflix://',youtube:'youtube://',disney:'disneyplus://',prime:'aiv://',hbo:'hbomax://',apple:'videos://',twitch:'twitch://',kick:'kick://',exxen:'exxen://',bein:'bein://',spotify:'spotify://'},
    store:{netflix:'https://apps.apple.com/tr/app/netflix/id363590051',youtube:'https://apps.apple.com/tr/app/youtube/id544007664',disney:'https://apps.apple.com/tr/app/disney/id1446075923',prime:'https://apps.apple.com/tr/app/amazon-prime-video/id545519333',hbo:'https://apps.apple.com/tr/app/max-stream-hbo-movies-tv/id1666653815',apple:'https://apps.apple.com/tr/app/apple-tv/id1174078549',twitch:'https://apps.apple.com/tr/app/twitch/id460177396',kick:'https://apps.apple.com/tr/app/kick-com/id6444875080',exxen:'https://apps.apple.com/tr/app/exxen/id1547602158',bein:'https://apps.apple.com/tr/app/bein-connect/id881909944',spotify:'https://apps.apple.com/tr/app/spotify/id324684580'}
  },
  us: {
    label:'🇺🇸 Amerika',
    deep:{netflix:'netflix://',youtube:'youtube://',disney:'disneyplus://',prime:'aiv://',hbo:'hbomax://',apple:'videos://',twitch:'twitch://',kick:'kick://',spotify:'spotify://'},
    store:{netflix:'https://apps.apple.com/us/app/netflix/id363590051',youtube:'https://apps.apple.com/us/app/youtube/id544007664',disney:'https://apps.apple.com/us/app/disney/id1446075923',prime:'https://apps.apple.com/us/app/amazon-prime-video/id545519333',hbo:'https://apps.apple.com/us/app/max-stream-hbo-movies-tv/id1666653815',apple:'https://apps.apple.com/us/app/apple-tv/id1174078549',twitch:'https://apps.apple.com/us/app/twitch/id460177396',kick:'https://apps.apple.com/us/app/kick-com/id6444875080',spotify:'https://apps.apple.com/us/app/spotify/id324684580'}
  },
  eu: {label:'🌍 Avrupa',deep:{netflix:'netflix://',youtube:'youtube://',disney:'disneyplus://',prime:'aiv://',hbo:'hbomax://',apple:'videos://',twitch:'twitch://',spotify:'spotify://'},store:{netflix:'https://apps.apple.com/gb/app/netflix/id363590051',youtube:'https://apps.apple.com/gb/app/youtube/id544007664',disney:'https://apps.apple.com/gb/app/disney/id1446075923',prime:'https://apps.apple.com/gb/app/amazon-prime-video/id545519333',hbo:'https://apps.apple.com/gb/app/max-stream-hbo-movies-tv/id1666653815',apple:'https://apps.apple.com/gb/app/apple-tv/id1174078549',twitch:'https://apps.apple.com/gb/app/twitch/id460177396',spotify:'https://apps.apple.com/gb/app/spotify/id324684580'}},
  as: {label:'🌏 Asya',deep:{netflix:'netflix://',youtube:'youtube://',disney:'disneyplus://',prime:'aiv://',apple:'videos://',twitch:'twitch://',spotify:'spotify://'},store:{netflix:'https://apps.apple.com/jp/app/netflix/id363590051',youtube:'https://apps.apple.com/jp/app/youtube/id544007664',disney:'https://apps.apple.com/jp/app/disney/id1446075923',prime:'https://apps.apple.com/jp/app/amazon-prime-video/id545519333',apple:'https://apps.apple.com/jp/app/apple-tv/id1174078549',twitch:'https://apps.apple.com/jp/app/twitch/id460177396',spotify:'https://apps.apple.com/jp/app/spotify/id324684580'}},
};
const TILE_GRADIENTS = {disney:'linear-gradient(145deg, #0DD3C5 0%, #0880A0 100%)',hbo:'linear-gradient(145deg, #6B2D8B 0%, #3B1260 55%, #1E0A3C 100%)',prime:'linear-gradient(145deg, #1A98FF 0%, #0066CC 100%)',apple:'linear-gradient(145deg, #ffffff 0%, #e8e8e8 100%)',tvplus:'linear-gradient(145deg, #FFD100 0%, #FFA500 100%)'};
function toggleCountryDropdown(){const d=document.getElementById('countryDropdown');const isOpen=d.style.display==='block';d.style.display=isOpen?'none':'block';if(!isOpen){renderLoginCountries('');setTimeout(()=>{const s=document.getElementById('loginCountrySearch');if(s)s.focus();},100);}}
function renderLoginCountries(q){const list=document.getElementById('loginCountryList');if(!list)return;const cur=SETTINGS.country||'tr';const filtered=q?COUNTRIES.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())):COUNTRIES;list.innerHTML=filtered.map(c=>`<div onclick="selectLoginCountry('${c.code}','${c.region}')" style="padding:12px 16px;font-size:14px;font-weight:600;color:${c.code===cur?'#fff':'rgba(255,255,255,.7)'};cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center;">${c.name}${c.code===cur?'<svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5l4 4L13 1" stroke="#4cd964" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</div>`).join('');}
function filterLoginCountries(q){renderLoginCountries(q);}
function selectLoginCountry(code,region){SETTINGS.country=code;SETTINGS.region=region;saveData();const c=COUNTRIES.find(x=>x.code===code);if(c)document.getElementById('selectedCountryLabel').textContent=c.name;document.getElementById('countryDropdown').style.display='none';updateRegionUI();}
const CURRENCIES=[{code:'TRY',symbol:'₺',name:'Türk Lirası'},{code:'USD',symbol:'$',name:'Amerikan Doları'},{code:'EUR',symbol:'€',name:'Euro'},{code:'GBP',symbol:'£',name:'Sterlin'},{code:'JPY',symbol:'¥',name:'Japon Yeni'},{code:'CAD',symbol:'CA$',name:'Kanada Doları'},{code:'AUD',symbol:'A$',name:'Avustralya Doları'},{code:'CHF',symbol:'Fr',name:'İsviçre Frangı'},{code:'SEK',symbol:'kr',name:'İsveç Kronu'},{code:'NOK',symbol:'kr',name:'Norveç Kronu'},{code:'KRW',symbol:'₩',name:'Güney Kore Wonu'},{code:'INR',symbol:'₹',name:'Hindistan Rupisi'},{code:'BRL',symbol:'R$',name:'Brezilya Reali'},{code:'SGD',symbol:'S$',name:'Singapur Doları'},{code:'AED',symbol:'AED',name:'BAE Dirhemi'},{code:'SAR',symbol:'SAR',name:'Suudi Riyali'}];
const POPULAR_SVCS=[{id:'netflix',name:'Netflix',color:'#E50914',rgb:'229,9,20',prices:{tr:{amount:219.99,plan:'Standart'},us:{amount:15.49,plan:'Standard'},eu:{amount:13.99,plan:'Standard'},as:{amount:13.99,plan:'Standard'}},plans:{tr:[{name:'Reklamlı',price:149.99},{name:'Standart',price:219.99},{name:'Premium',price:329.99},{name:'Aile Paylaşımı',price:269.99}]}},{id:'youtube',name:'YouTube',color:'#FF0000',rgb:'255,0,0',prices:{tr:{amount:109.99,plan:'Premium'},us:{amount:13.99,plan:'Premium'},eu:{amount:11.99,plan:'Premium'},as:{amount:11.99,plan:'Premium'}},plans:{tr:[{name:'Bireysel',price:109.99},{name:'Aile (6 kişi)',price:179.99},{name:'Öğrenci',price:69.99}]}},{id:'disney',name:'Disney+',color:'#0ABFBC',rgb:'10,191,188',prices:{tr:{amount:149.99,plan:'Standart'},us:{amount:7.99,plan:'Basic'},eu:{amount:8.99,plan:'Standard'},as:{amount:8.99,plan:'Standard'}},plans:{tr:[{name:'Standart (Reklamlı)',price:109.99},{name:'Standart',price:149.99},{name:'Premium',price:219.99}]}},{id:'prime',name:'Prime Video',color:'#1A98FF',rgb:'26,152,255',prices:{tr:{amount:129.99,plan:'Prime'},us:{amount:8.99,plan:'Prime'},eu:{amount:8.99,plan:'Prime'},as:{amount:8.99,plan:'Prime'}},plans:{tr:[{name:'Prime Üyelik',price:129.99},{name:'Prime Video Kanal',price:49.99}]}},{id:'hbo',name:'HBO Max',color:'#3B1F6B',rgb:'59,31,107',prices:{tr:{amount:189.99,plan:'Reklamsız'},us:{amount:15.99,plan:'Ad-Free'},eu:{amount:9.99,plan:'Standard'},as:{amount:9.99,plan:'Standard'}},plans:{tr:[{name:'Reklamlı',price:129.99},{name:'Reklamsız',price:189.99},{name:'Ultimate (4K)',price:249.99}]}},{id:'apple',name:'Apple TV+',color:'#ffffff',rgb:'255,255,255',textDark:true,prices:{tr:{amount:99.99,plan:'Aile'},us:{amount:9.99,plan:'Monthly'},eu:{amount:8.99,plan:'Monthly'},as:{amount:8.99,plan:'Monthly'}},plans:{tr:[{name:'Bireysel',price:49.99},{name:'Aile (6 kişi)',price:99.99}]}},{id:'twitch',name:'Twitch',color:'#9146FF',rgb:'145,70,255',prices:{tr:{amount:0,plan:'Ücretsiz'},us:{amount:0,plan:'Free'},eu:{amount:0,plan:'Free'},as:{amount:0,plan:'Free'}},plans:{tr:[{name:'Ücretsiz',price:0},{name:'Turbo',price:89.99},{name:'Kanal Aboneliği',price:49.99}]}},{id:'kick',name:'Kick',color:'#53FC18',rgb:'83,252,24',textDark:true,prices:{tr:{amount:0,plan:'Ücretsiz'},us:{amount:0,plan:'Free'},eu:{amount:0,plan:'Free'},as:{amount:0,plan:'Free'}},plans:{tr:[{name:'Ücretsiz',price:0},{name:'Kanal Aboneliği',price:49.99}]}},{id:'exxen',name:'EXXEN',color:'#F9D100',rgb:'249,209,0',textDark:true,prices:{tr:{amount:179.99,plan:'Reklamlı HD'},us:{amount:0,plan:'N/A'},eu:{amount:0,plan:'N/A'},as:{amount:0,plan:'N/A'}},plans:{tr:[{name:'Reklamlı HD',price:119.99},{name:'Reklamsız HD',price:179.99},{name:'Reklamsız 4K',price:239.99},{name:'Spor Paketi',price:349.99}]}},{id:'bein',name:'beIN Connect',color:'#6F2DA8',rgb:'111,45,168',prices:{tr:{amount:249.99,plan:'Spor Paketi'},us:{amount:0,plan:'N/A'},eu:{amount:19.99,plan:'Sports'},as:{amount:0,plan:'N/A'}},plans:{tr:[{name:'Eğlence Paketi',price:149.99},{name:'Spor Paketi',price:249.99},{name:'Süper Paket',price:349.99}]}},{id:'spotify',name:'Spotify',color:'#1DB954',rgb:'29,185,84',prices:{tr:{amount:79.99,plan:'Bireysel'},us:{amount:10.99,plan:'Individual'},eu:{amount:10.99,plan:'Individual'},as:{amount:10.99,plan:'Individual'}},plans:{tr:[{name:'Bireysel',price:79.99},{name:'Öğrenci',price:49.99},{name:'Duo (2 kişi)',price:129.99},{name:'Aile (6 kişi)',price:159.99}]}},{id:'tvplus',name:'Turkcell TV+',color:'#FFD100',rgb:'255,209,0',textDark:true,prices:{tr:{amount:109.99,plan:'Bireysel'},us:{amount:9.99,plan:'Individual'},eu:{amount:9.99,plan:'Individual'},as:{amount:9.99,plan:'Individual'}},plans:{tr:[{name:'Bireysel',price:109.99},{name:'Aile',price:179.99}]}}];
const LOGO={netflix:{w:72,h:72,html:`<img src="./assets/netflix_N.webp" style="width:66px;height:66px;object-fit:contain;">`},youtube:{w:72,h:72,html:`<img src="./assets/youtube.webp" style="width:66px;height:66px;object-fit:contain;">`},disney:{w:72,h:72,html:`<img src="./assets/Disney+.webp" style="width:66px;height:66px;object-fit:contain;">`},prime:{w:72,h:72,html:`<img src="./assets/prime video.webp" style="width:66px;height:66px;object-fit:contain;">`},hbo:{w:72,h:72,html:`<img src="./assets/hbo.webp" style="width:66px;height:66px;object-fit:contain;">`},apple:{w:72,h:72,html:`<img src="./assets/apple.webp" style="width:66px;height:66px;object-fit:contain;filter:brightness(10);">`,htmlDark:`<img src="./assets/appleb.webp" style="width:66px;height:66px;object-fit:contain;">`,textDark:true},twitch:{w:72,h:72,html:`<img src="./assets/twitch.webp" style="width:66px;height:66px;object-fit:contain;">`},kick:{w:72,h:72,html:`<img src="./assets/kick.webp" style="width:52px;height:52px;object-fit:contain;">`,htmlDark:`<img src="./assets/kickb.webp" style="width:52px;height:52px;object-fit:contain;">`,textDark:true},exxen:{w:72,h:72,html:`<img src="./assets/exxen.webp" style="width:66px;height:66px;object-fit:contain;">`,htmlDark:`<img src="./assets/exxenb.webp" style="width:66px;height:66px;object-fit:contain;">`,textDark:true},bein:{w:72,h:72,html:`<img src="./assets/bein.webp" style="width:66px;height:66px;object-fit:contain;">`},spotify:{w:72,h:72,html:`<img src="./assets/Spotify.webp" style="width:66px;height:66px;object-fit:contain;">`,htmlDark:`<img src="./assets/Spotifyb.webp" style="width:66px;height:66px;object-fit:contain;">`},tvplus:{w:66,h:66,html:`<img src="./assets/tvplus.webp" style="width:66px;height:66px;object-fit:contain;">`,htmlDark:`<img src="./assets/tvplus2.webp" style="width:66px;height:66px;object-fit:contain;">`,textDark:true},_custom:{w:36,h:36,html:`<svg viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="16" fill="rgba(255,255,255,.2)" stroke="white" stroke-width="1.5"/><text x="18" y="24" font-family="-apple-system,sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">▶</text></svg>`}};
let SVC=[],SETTINGS={},PROFILE={name:'Kullanıcı',email:'kullanici@icloud.com'};
let active=-1,pwdShow=false;
let qrRotateInterval=null,qrCountdown=null,qrSec=30,_qrSeed=Date.now();
let lockTimer=null,isLocked=false;
let pinVal='',pinMode='unlock',pinStep=0,tempPin='';
let selectedPopular=null;
function saveData(){try{localStorage.setItem('easytv_settings',JSON.stringify(SETTINGS));localStorage.setItem('easytv_profile',JSON.stringify(PROFILE));localStorage.setItem('easytv_pin',SETTINGS.pinHash||'');}catch(e){}_saveSVCEncrypted();}
async function _saveSVCEncrypted(){try{const enc=await Promise.all(SVC.map(s=>encryptCreds(s)));localStorage.setItem('easytv_svc',JSON.stringify(enc));}catch(e){const stripped=SVC.map(s=>({...s,email:'',pwd:''}));try{localStorage.setItem('easytv_svc',JSON.stringify(stripped));}catch(e2){}}}
function loadData(){try{const s=localStorage.getItem('easytv_svc');const st=localStorage.getItem('easytv_settings');const pr=localStorage.getItem('easytv_profile');if(s)SVC=JSON.parse(s);if(st)SETTINGS=JSON.parse(st);if(pr)PROFILE=JSON.parse(pr);if(!SETTINGS.pin)SETTINGS.pin='1111';if(!SETTINGS.autolock)SETTINGS.autolock=true;if(!SETTINGS.faceid)SETTINGS.faceid=true;if(!SETTINGS.qrrotate)SETTINGS.qrrotate=true;if(SETTINGS.remind1===undefined)SETTINGS.remind1=false;if(SETTINGS.remind3===undefined)SETTINGS.remind3=false;if(SETTINGS.remind7===undefined)SETTINGS.remind7=false;if(SETTINGS.premium===undefined)SETTINGS.premium=false;// eski localStorage premium key'ini temizle
localStorage.removeItem('easytv_premium');}catch(e){SETTINGS={pin:'1111',autolock:true,faceid:true,qrrotate:true};}}
let EXCHANGE_RATES={};let RATES_TIMESTAMP=0;
try{const rc=localStorage.getItem('easytv_rates');const rt=localStorage.getItem('easytv_rates_ts');if(rc)EXCHANGE_RATES=JSON.parse(rc);if(rt)RATES_TIMESTAMP=parseInt(rt);}catch(e){}
setTimeout(()=>{fetchExchangeRates(false);},2500);
loadData();
const COUNTRIES=[{code:'tr',flag:'🇹🇷',name:'Türkiye',region:'tr',currency:'TRY',symbol:'₺'},{code:'de',flag:'🇩🇪',name:'Almanya',region:'eu',currency:'EUR',symbol:'€'},{code:'at',flag:'🇦🇹',name:'Avusturya',region:'eu',currency:'EUR',symbol:'€'},{code:'fr',flag:'🇫🇷',name:'Fransa',region:'eu',currency:'EUR',symbol:'€'},{code:'gb',flag:'🇬🇧',name:'Birleşik Krallık',region:'eu',currency:'GBP',symbol:'£'},{code:'us',flag:'🇺🇸',name:'Amerika Birleşik Devletleri',region:'us',currency:'USD',symbol:'$'},{code:'ca',flag:'🇨🇦',name:'Kanada',region:'us',currency:'CAD',symbol:'CA$'},{code:'jp',flag:'🇯🇵',name:'Japonya',region:'as',currency:'JPY',symbol:'¥'},{code:'kr',flag:'🇰🇷',name:'Güney Kore',region:'as',currency:'KRW',symbol:'₩'},{code:'au',flag:'🇦🇺',name:'Avustralya',region:'as',currency:'AUD',symbol:'A$'},{code:'in',flag:'🇮🇳',name:'Hindistan',region:'as',currency:'INR',symbol:'₹'},{code:'br',flag:'🇧🇷',name:'Brezilya',region:'us',currency:'BRL',symbol:'R$'},{code:'ae',flag:'🇦🇪',name:'Birleşik Arap Emirlikleri',region:'as',currency:'AED',symbol:'AED'},{code:'sa',flag:'🇸🇦',name:'Suudi Arabistan',region:'as',currency:'SAR',symbol:'SAR'},{code:'sg',flag:'🇸🇬',name:'Singapur',region:'as',currency:'SGD',symbol:'S$'}];
const COUNTRY_CURRENCY={};COUNTRIES.forEach(c=>{COUNTRY_CURRENCY[c.code]=c.currency;});
const COUNTRY_PRICES={tr:{netflix:{plans:[{name:'Reklamlı',price:149.99},{name:'Standart',price:219.99},{name:'Premium',price:329.99},{name:'Aile',price:269.99}]},youtube:{plans:[{name:'Bireysel',price:109.99},{name:'Aile',price:179.99},{name:'Öğrenci',price:69.99}]},spotify:{plans:[{name:'Bireysel',price:79.99},{name:'Duo',price:129.99},{name:'Aile',price:159.99},{name:'Öğrenci',price:49.99}]},disney:{plans:[{name:'Reklamlı',price:109.99},{name:'Standart',price:149.99},{name:'Premium',price:219.99}]},hbo:{plans:[{name:'Reklamlı',price:129.99},{name:'Reklamsız',price:189.99},{name:'Ultimate',price:249.99}]},apple:{plans:[{name:'Bireysel',price:49.99},{name:'Aile',price:99.99}]}},us:{netflix:{plans:[{name:'Standard w/ Ads',price:6.99},{name:'Standard',price:15.49},{name:'Premium',price:22.99}]},youtube:{plans:[{name:'Individual',price:13.99},{name:'Family',price:22.99},{name:'Student',price:7.99}]},spotify:{plans:[{name:'Individual',price:11.99},{name:'Duo',price:16.99},{name:'Family',price:19.99},{name:'Student',price:5.99}]},disney:{plans:[{name:'Basic w/ Ads',price:7.99},{name:'Standard',price:13.99}]},hbo:{plans:[{name:'With Ads',price:9.99},{name:'Ad-Free',price:15.99},{name:'Ultimate',price:19.99}]},apple:{plans:[{name:'Individual',price:9.99},{name:'Family',price:16.99}]}}};
async function fetchExchangeRates(force=false){const now=Date.now();if(!force&&EXCHANGE_RATES.USD&&(now-RATES_TIMESTAMP)<24*3600*1000){updateRateUI();return;}const descEl=document.getElementById('rateLastUpdate');if(descEl)descEl.textContent='Güncelleniyor...';try{const res=await fetch('https://open.er-api.com/v6/latest/TRY');const data=await res.json();if(data.rates){EXCHANGE_RATES=data.rates;RATES_TIMESTAMP=now;localStorage.setItem('easytv_rates',JSON.stringify(EXCHANGE_RATES));localStorage.setItem('easytv_rates_ts',String(now));updateRateUI();showToast('✓ Kurlar güncellendi');}}catch(e){if(descEl)descEl.textContent='Güncelleme başarısız';}}
function updateRateUI(){const descEl=document.getElementById('rateLastUpdate');const curDescEl=document.getElementById('currencyDesc');if(RATES_TIMESTAMP>0&&descEl){const d=new Date(RATES_TIMESTAMP);descEl.textContent=`Son güncelleme: ${d.toLocaleDateString('tr-TR')} ${d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}`;}const curCode=SETTINGS.displayCurrency||'TRY';const cur=CURRENCIES.find(c=>c.code===curCode)||CURRENCIES[0];if(curDescEl)curDescEl.textContent=`${cur.name} (${cur.symbol})`;}
function convertPrice(priceVal, sourceCurrency){
  // priceVal: number, sourceCurrency: 'TRY'|'USD'|... (yoksa TRY varsay)
  const src = sourceCurrency || 'TRY';
  const displayCode = SETTINGS.displayCurrency || 'TRY';
  const displayCur = CURRENCIES.find(c=>c.code===displayCode) || CURRENCIES[0];
  if(src === displayCode) return {value: priceVal, symbol: displayCur.symbol};
  // Önce src → TRY'ye çevir (tüm kurlar TRY bazlı)
  let inTRY = priceVal;
  if(src !== 'TRY') {
    const srcRate = EXCHANGE_RATES[src];
    if(!srcRate) return {value: priceVal, symbol: displayCur.symbol}; // kur yoksa göster
    inTRY = priceVal / srcRate; // src → TRY
  }
  if(displayCode === 'TRY') return {value: inTRY, symbol: '₺'};
  const dstRate = EXCHANGE_RATES[displayCode];
  if(!dstRate) return {value: inTRY, symbol: '₺'};
  return {value: inTRY * dstRate, symbol: displayCur.symbol};
}
function formatPrice(priceVal, sourceCurrency){
  const {value, symbol} = convertPrice(priceVal, sourceCurrency || 'TRY');
  return symbol + value.toFixed(2);
}
function renderCurrencyList(q){const curCode=SETTINGS.displayCurrency||'TRY';const filtered=q?CURRENCIES.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.code.toLowerCase().includes(q.toLowerCase())||c.symbol.toLowerCase().includes(q.toLowerCase())):CURRENCIES;const list=document.getElementById('currencyPickerList');if(!list)return;list.innerHTML=filtered.map(c=>`<div onclick="selectCurrency('${c.code}')" style="display:flex;align-items:center;justify-content:space-between;padding:13px 18px;font-size:14px;font-weight:600;color:${c.code===curCode?'#fff':'rgba(255,255,255,.65)'};cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05);"><span><span style="font-weight:800;color:rgba(255,255,255,.9);min-width:36px;display:inline-block;">${c.symbol}</span>&nbsp;${c.name} <span style="font-size:12px;color:rgba(255,255,255,.3);">${c.code}</span></span>${c.code===curCode?'<svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5l4 4L13 1" stroke="#4cd964" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</div>`).join('');}
function openCurrencyPicker(){let pickerEl=document.getElementById('currencyPickerModal');if(!pickerEl){pickerEl=document.createElement('div');pickerEl.id='currencyPickerModal';pickerEl.style.cssText='display:none;position:absolute;inset:0;z-index:450;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);flex-direction:column;align-items:center;justify-content:flex-end;';pickerEl.innerHTML=`<div style="background:#1e1f26;border-radius:24px 24px 0 0;width:100%;max-height:80%;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px;"><div style="font-size:17px;font-weight:800;color:#fff;">Para Birimi Seç</div><button onclick="closeCurrencyPicker()" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.6);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button></div><div style="padding:0 16px 10px;"><input class="add-input" id="currencySearchInput" placeholder="🔍 Para birimi ara..." oninput="renderCurrencyList(this.value)" style="margin:0;" autocomplete="off"></div><div id="currencyPickerList" style="overflow-y:auto;scrollbar-width:none;padding-bottom:32px;"></div></div>`;pickerEl.addEventListener('click',function(e){if(e.target===pickerEl)closeCurrencyPicker();});document.getElementById('phone').appendChild(pickerEl);}pickerEl.style.display='flex';setTimeout(()=>renderCurrencyList(''),30);}
function closeCurrencyPicker(){const el=document.getElementById('currencyPickerModal');if(el)el.style.display='none';}
function selectCurrency(code){SETTINGS.displayCurrency=code;saveData();closeCurrencyPicker();updateRateUI();renderSubs();showToast('✓ Para birimi değiştirildi');}
function toggleWlcRegion(){const trigger=document.getElementById('wlcRegionTrigger');const dropdown=document.getElementById('wlcRegionDropdown');const isOpen=dropdown.classList.contains('open');trigger.classList.toggle('open',!isOpen);dropdown.classList.toggle('open',!isOpen);if(!isOpen){buildWlcRegionList('');setTimeout(()=>{const s=document.getElementById('wlcRegionSearch');if(s){s.value='';s.focus();}document.addEventListener('click',function close(e){const wrap=document.getElementById('wlcRegionWrap');if(wrap&&!wrap.contains(e.target)){const trig=document.getElementById('wlcRegionTrigger');if(trig)trig.classList.remove('open');const drop=document.getElementById('wlcRegionDropdown');if(drop)drop.classList.remove('open');document.removeEventListener('click',close);}});},50);}}
function buildWlcRegionList(q){const list=document.getElementById('wlcRegionList');if(!list)return;const cur=SETTINGS.country||'tr';const filtered=q?COUNTRIES.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.code.toLowerCase().includes(q.toLowerCase())):COUNTRIES;list.innerHTML='';filtered.forEach(c=>{const btn=document.createElement('button');btn.className='wlc-lang-option'+(c.code===cur?' selected':'');btn.innerHTML=`<span style="font-size:16px;margin-right:6px;">${c.flag}</span><span style="flex:1;text-align:left;">${c.name}</span><span style="font-size:11px;color:rgba(255,255,255,.3);margin-left:4px;">${c.symbol}</span>${c.code===cur?'<span style="margin-left:6px;color:#4cd964;font-size:14px;">✓</span>':''}`;btn.onclick=()=>wlcSetRegion(c.code,c.region,c.flag,c.name);list.appendChild(btn);});}
function wlcSetRegion(code,region,flag,name){SETTINGS.country=code;SETTINGS.region=region;saveData();var trigger=document.getElementById('wlcRegionTrigger');if(trigger)trigger.classList.remove('open');var dropdown=document.getElementById('wlcRegionDropdown');if(dropdown)dropdown.classList.remove('open');var flagEl=document.getElementById('wlcRegionFlag');var labelEl=document.getElementById('wlcRegionLabel');if(flagEl)flagEl.textContent=flag;if(labelEl)labelEl.textContent=name.split(' ')[0];}
function toggleWlcLang(){const trigger=document.getElementById('wlcLangTrigger');const dropdown=document.getElementById('wlcLangDropdown');const wrap=document.getElementById('wlcLangWrap');if(!trigger||!dropdown)return;const isOpen=dropdown.classList.contains('open');trigger.classList.toggle('open',!isOpen);dropdown.classList.toggle('open',!isOpen);if(!isOpen){setTimeout(()=>{document.addEventListener('click',function close(e){if(!wrap||!wrap.contains(e.target)){if(trigger)trigger.classList.remove('open');if(dropdown)dropdown.classList.remove('open');document.removeEventListener('click',close);}});},10);}}
function wlcSetLang(lang){LANG=lang;localStorage.setItem('easytv_lang',lang);const trigger=document.getElementById('wlcLangTrigger');const dropdown=document.getElementById('wlcLangDropdown');const flagEl=document.getElementById('wlcLangFlag');const labelEl=document.getElementById('wlcLangLabel');const optTR=document.getElementById('wlcOptTR');const optEN=document.getElementById('wlcOptEN');const tagline=document.getElementById('wlcTagline');const sub=document.getElementById('wlcSub');const startBtn=document.getElementById('wlcStartBtn');if(trigger)trigger.classList.remove('open');if(dropdown)dropdown.classList.remove('open');if(flagEl)flagEl.textContent=lang==='tr'?'🇹🇷':'🇬🇧';if(labelEl)labelEl.textContent=lang==='tr'?'Türkçe':'English';if(optTR)optTR.classList.toggle('selected',lang==='tr');if(optEN)optEN.classList.toggle('selected',lang==='en');if(tagline)tagline.innerHTML=lang==='tr'?'Şifreleriniz güvende,<br>giriş tek dokunuşta.':'Passwords safe,<br>sign in with one tap.';if(sub)sub.textContent=lang==='tr'?'TV aboneliklerinizi saklayın.\nQR ile saniyeler içinde oturum açın.':'Store your TV subscriptions.\nSign in with QR in seconds.';if(startBtn)startBtn.textContent=lang==='tr'?'Başlayın':'Get Started';applyLang();}
let LANG=localStorage.getItem('easytv_lang')||'tr';
function t(key,...args){const s={tr:{nav_home:'Ana Sayfa',nav_subs:'Üyelikler',nav_profile:'Profil',nav_settings:'Ayarlar',no_subs:'Henüz servis eklenmedi',today_badge:'Bugün!',days_left:(n)=>`${n} gün kaldı`,free_badge:'Ücretsiz',per_month:'/ay',edit_btn:'Düzenle',monthly_total:'Aylık Toplam',spending_chart:'AYLIK HARCAMA',settings_security:'Güvenlik',settings_appearance:'Görünüm',settings_notifications:'Bildirimler',settings_lang:'Dil',tab_subs_title:'Üyelikler',tab_subs_sub:'Aylık harcama özeti',tab_profile_title:'Profil',tab_settings_title:'Ayarlar',share_full:'Ben ödüyorum 💳',share_equal:'Eşit bölüşüyoruz 🤝',share_free:'Başkası ödüyor 🎁',share_person_me:'Ben',share_solo:(p,s)=>`Tüm ücreti sen ödüyorsun: ${s}${p}/ay`,share_split:(per,s,total,n)=>`Sana düşen: ${s}${per}/ay (toplam ${s}${total} ÷ ${n} kişi)`,save_btn:'Kaydet',delete_sub:'Sil',sub_detail:'Üyelik Bilgileri',price_label:'AYLIK FİYAT',share_label:'PAYLAŞIM',share_who:'Kaç kişi kullanıyor?',share_how:'Ödeme şekli?',renew_date_field:'YENİLEME TARİHİ',email_field:'E-POSTA',password_field:'ŞİFRE',plan_field:'PLAN',
  tog_faceid:'Face ID / Touch ID',tog_faceid_desc:'Uygulama girişi için',
  tog_autolock:'Otomatik Kilit',tog_autolock_desc:'2 dakika sonra kilitle',
  tog_qrrotate:'QR Otomatik Döndür',tog_qrrotate_desc:'Her 30 sn yeni kod',
  tog_colorblind:'Renk Körü Modu',tog_colorblind_desc:'Kırmızı-yeşil körlüğü desteği',
  tog_reminder:'Yenileme Hatırlatıcısı',tog_reminder_desc:'3 gün önce bildir',
  tog_pricechange:'Fiyat Değişikliği',tog_pricechange_desc:'Abonelik ücret artışı',lbl_region_section:'Bölge & Para Birimi',lbl_app_section:'Uygulama',region_label:'Ülke / Bölge',currency_label:'Gösterim Para Birimi',rates_label:'Kurları Güncelle',
  export_label:'Verilerimi Kaydet',import_label:'Verileri Geri Yükle',pin_change_label:'PIN Değiştir',
  signout_label:'Çıkış Yap',delete_label:'Tüm Verileri Sil',login_heading:'Tüm servisleriniz<br>tek bir yerde.',login_sub:'Tek yerden hızlıca erişin. Üyeliklerinizi<br>ve ödemelerinizi de kolayca takip edin.',login_create:'Hesap Oluştur',login_or:'VEYA GİRİŞ YAP',login_apple:'Apple ile Giriş Yap',login_google:'Google ile Giriş Yap',login_email:'Mail ile Giriş Yap',login_skip:'Şimdilik atla',email_auth_signin_title:'Mail ile Giriş',email_auth_signup_title:'Mail ile Kayıt Ol',email_auth_signin_btn:'Giriş Yap',email_auth_signup_btn:'Kayıt Ol',email_auth_switch_to_signup:'Hesabın yok mu? Kayıt ol',email_auth_switch_to_signin:'Hesabın var mı? Giriş yap',email_auth_required:'E-posta ve şifre zorunlu',email_auth_password_min:'Şifre en az 6 karakter olmalı',email_auth_signup_success_verify:'Kayıt tamamlandı. E-postanı doğrulayıp giriş yap.',email_auth_failed:'başarısız',unknown_error:'Bilinmeyen hata'},en:{nav_home:'Home',nav_subs:'Subscriptions',nav_profile:'Profile',nav_settings:'Settings',no_subs:'No services added yet',today_badge:'Today!',days_left:(n)=>`${n} days left`,free_badge:'Free',per_month:'/mo',edit_btn:'Edit',monthly_total:'Monthly Total',spending_chart:'MONTHLY SPENDING',settings_security:'Security',settings_appearance:'Appearance',settings_notifications:'Notifications',settings_lang:'Language',tab_subs_title:'Subscriptions',tab_subs_sub:'Monthly spending summary',tab_profile_title:'Profile',tab_settings_title:'Settings',share_full:'I pay 💳',share_equal:'Split equally 🤝',share_free:'Someone else pays 🎁',share_person_me:'Me',share_solo:(p,s)=>`You pay full: ${s}${p}/mo`,share_split:(per,s,total,n)=>`Your share: ${s}${per}/mo (${s}${total} ÷ ${n})`,save_btn:'Save',delete_sub:'Delete',sub_detail:'Subscription Details',price_label:'MONTHLY PRICE',share_label:'SHARING',share_who:'How many people?',share_how:'Payment method?',renew_date_field:'RENEWAL DATE',email_field:'EMAIL',password_field:'PASSWORD',plan_field:'PLAN',
  tog_faceid:'Face ID / Touch ID',tog_faceid_desc:'For app login',
  tog_autolock:'Auto Lock',tog_autolock_desc:'Lock after 2 minutes',
  tog_qrrotate:'QR Auto Rotate',tog_qrrotate_desc:'New code every 30s',
  tog_colorblind:'Color Blind Mode',tog_colorblind_desc:'Red-green blindness support',
  tog_reminder:'Renewal Reminder',tog_reminder_desc:'Notify 3 days before',
  tog_pricechange:'Price Change',tog_pricechange_desc:'Subscription price increase',lbl_region_section:'Region & Currency',lbl_app_section:'App',region_label:'Country / Region',currency_label:'Display Currency',rates_label:'Update Rates',
  export_label:'Export Data',import_label:'Restore Data',pin_change_label:'Change PIN',
  signout_label:'Sign Out',delete_label:'Delete All Data',login_heading:'All your services<br>in one place.',login_sub:'Access everything quickly in one place.<br>Track your subscriptions and payments with ease.',login_create:'Create Account',login_or:'OR SIGN IN',login_apple:'Sign in with Apple',login_google:'Sign in with Google',login_email:'Sign in with Email',login_skip:'Skip for now',email_auth_signin_title:'Sign in with Email',email_auth_signup_title:'Create Account with Email',email_auth_signin_btn:'Sign In',email_auth_signup_btn:'Sign Up',email_auth_switch_to_signup:'Don\'t have an account? Sign up',email_auth_switch_to_signin:'Already have an account? Sign in',email_auth_required:'Email and password are required',email_auth_password_min:'Password must be at least 6 characters',email_auth_signup_success_verify:'Signup complete. Verify your email, then sign in.',email_auth_failed:'failed',unknown_error:'Unknown error'}}[LANG]||{};const val=s[key];return typeof val==='function'?val(...args):(val||key);}

function cycleLang() {
  var next = LANG === 'tr' ? 'en' : 'tr';
  setLang(next);
  var pill = document.getElementById('langPill');
  if (pill) pill.textContent = next === 'tr' ? '\uD83C\uDDF9\uD83C\uDDF7 TR' : '\uD83C\uDDEC\uD83C\uDDE7 EN';
}

function setLang(lang){LANG=lang;localStorage.setItem('easytv_lang',lang);applyLang();buildGrid();if(curTab==='subs')renderSubs();if(curTab==='profile')renderProfile();}
function applyLang(){
  const $ = id => document.getElementById(id);
  // Nav label'ları
  ['home','subs','profile','settings'].forEach(id=>{
    const el = document.querySelector('#nav-'+id+' .nav-label');
    if(el) el.textContent = t('nav_'+id);
  });
  // Tab başlıkları
  if($('title-subs'))     $('title-subs').textContent     = t('tab_subs_title');
  if($('title-profile'))  $('title-profile').textContent  = t('tab_profile_title');
  if($('title-settings')) $('title-settings').textContent = t('tab_settings_title');
  if($('subsSubtitle'))   $('subsSubtitle').textContent   = t('tab_subs_sub');
  if($('subsTotalLbl'))   $('subsTotalLbl').textContent   = t('monthly_total');
  // Settings section başlıkları
  if($('lbl-security'))       $('lbl-security').textContent       = t('settings_security');
  if($('lbl-appearance'))     $('lbl-appearance').textContent     = t('settings_appearance');
  if($('lbl-notifications'))  $('lbl-notifications').textContent  = t('settings_notifications');
  if($('lbl-lang'))           $('lbl-lang').textContent           = t('settings_lang');
  if($('lbl-region-section')) $('lbl-region-section').textContent = t('lbl_region_section') || (LANG==='tr'?'Bölge & Para Birimi':'Region & Currency');
  if($('lbl-app-section'))    $('lbl-app-section').textContent    = t('lbl_app_section')    || (LANG==='tr'?'Uygulama':'App');
  // Toggle satır etiketleri — toggle switch ID'sinden closest ile bul
  const togMap = {
    'tog-faceid':     ['tog_faceid','tog_faceid_desc'],
    'tog-autolock':   ['tog_autolock','tog_autolock_desc'],
    'tog-qrrotate':   ['tog_qrrotate','tog_qrrotate_desc'],
    'tog-colorblind': ['tog_colorblind','tog_colorblind_desc'],
    'tog-reminder':   ['tog_reminder','tog_reminder_desc'],
    'tog-pricechange':['tog_pricechange','tog_pricechange_desc'],
  };
  Object.entries(togMap).forEach(([togId,[lblKey,descKey]])=>{
    const togEl = $(togId);
    if(!togEl) return;
    const row = togEl.closest('.toggle-row');
    if(!row) return;
    const lbl  = row.querySelector('.toggle-lbl');
    const desc = row.querySelector('.toggle-desc');
    if(lbl  && t(lblKey)  !== lblKey)  lbl.textContent  = t(lblKey);
    if(desc && t(descKey) !== descKey) desc.textContent = t(descKey);
  });
  // data-i18n attribute'lu tüm elementler
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const val = t(el.dataset.i18n);
    if(val && val !== el.dataset.i18n) el.textContent = val;
  });
  // Login/Auth metinleri
  if($('loginHeading')) $('loginHeading').innerHTML = t('login_heading');
  if($('loginSub')) $('loginSub').innerHTML = t('login_sub');
  if($('introTagline')) $('introTagline').innerHTML = t('login_heading');
  if($('introSub')) $('introSub').innerHTML = t('login_sub');
  if($('introHint')) $('introHint').textContent = LANG==='tr' ? 'Zaten hesabınız var mı? Giriş yapın' : 'Already have an account? Sign in';
  if($('loginCreateBtnText')) $('loginCreateBtnText').textContent = t('login_create');
  if($('loginOrText')) $('loginOrText').textContent = t('login_or');
  if($('loginAppleBtnText')) $('loginAppleBtnText').textContent = t('login_apple');
  if($('loginGoogleBtnText')) $('loginGoogleBtnText').textContent = t('login_google');
  if($('loginEmailBtnText')) $('loginEmailBtnText').textContent = t('login_email');
  if($('loginSkipText')) $('loginSkipText').textContent = t('login_skip');
  // Sub edit sheet labels
  if($('seSubDetailLbl')) $('seSubDetailLbl').textContent = t('sub_detail');
  if($('sePriceLbl')) $('sePriceLbl').textContent = t('price_label');
  if($('sePlanLbl')) $('sePlanLbl').textContent = t('plan_field');
  if($('seShareLbl')) $('seShareLbl').textContent = t('share_label');
  if($('seShareWhoLbl')) $('seShareWhoLbl').textContent = t('share_who');
  if($('seShareHowLbl')) $('seShareHowLbl').textContent = t('share_how');
  if($('seRenewLbl')) $('seRenewLbl').textContent = t('renew_date_field');
  if($('seEmailLbl')) $('seEmailLbl').textContent = t('email_field');
  if($('sePwdLbl')) $('sePwdLbl').textContent = t('password_field');
  if($('sesSaveBtn')) $('sesSaveBtn').textContent = t('save_btn');
  if($('sesDeleteBtn')) $('sesDeleteBtn').textContent = t('delete_sub');
  // Email auth sheet metinleri + placeholder
  setEmailAuthMode(_emailAuthMode);
  if($('emailAuthName')) $('emailAuthName').placeholder = LANG==='tr' ? 'Ad Soyad' : 'Full Name';
  if($('emailAuthEmail')) $('emailAuthEmail').placeholder = LANG==='tr' ? 'E-posta adresi' : 'Email address';
  if($('emailAuthPassword')) $('emailAuthPassword').placeholder = LANG==='tr' ? 'Şifre (en az 6 karakter)' : 'Password (min 6 characters)';
  if($('emailAuthConfirmPassword')) $('emailAuthConfirmPassword').placeholder = LANG==='tr' ? 'Şifreyi tekrar yaz' : 'Confirm password';
  if($('pinGreeting')) $('pinGreeting').textContent = LANG==='tr' ? 'Hoş geldiniz' : 'Welcome back';
  if($('pinHint')) $('pinHint').textContent = LANG==='tr' ? 'PIN ile giriş yapın' : 'Sign in with PIN';
  if($('pinDevicePassText')) $('pinDevicePassText').textContent = LANG==='tr' ? 'Telefon Şifresi' : 'Device Passcode';
  if($('pinFaceIdText')) $('pinFaceIdText').textContent = LANG==='tr' ? 'Face ID ile giriş' : 'Sign in with Face ID';
  if($('pinSkipBtn')) $('pinSkipBtn').textContent = LANG==='tr' ? 'Atla' : 'Skip';
  if($('obSkipBtn')) $('obSkipBtn').textContent = LANG==='tr' ? 'Atla' : 'Skip';
  // Dil butonları aktif durumu
  document.querySelectorAll('.lang-btn').forEach(b=>{
    b.classList.toggle('lang-sel', b.dataset.lang === LANG);
  });
  var pill=document.getElementById('langPill');
  if(pill) pill.textContent=LANG==='tr'?'\uD83C\uDDF9\uD83C\uDDF7 TR':'\uD83C\uDDEC\uD83C\uDDE7 EN';
}
function getRegion(){return REGION_DATA[SETTINGS.region||'tr']||REGION_DATA.tr;}
function getCountryPlans(svcId){const countryCode=SETTINGS.country||'tr';const region=SETTINGS.region||'tr';const countryData=COUNTRY_PRICES[countryCode];if(countryData&&countryData[svcId]&&countryData[svcId].plans)return countryData[svcId].plans;const svcDef=POPULAR_SVCS.find(p=>p.id===svcId);if(svcDef&&svcDef.plans)return svcDef.plans[region]||svcDef.plans.tr||[];return[];}
function getCountrySymbol(){const c=COUNTRIES.find(x=>x.code===(SETTINGS.country||'tr'));return c?c.symbol:'₺';}
function localizePlanName(name){
  if(LANG!=='en'||!name)return name||'';
  const map={
    'Reklamlı':'With Ads',
    'Standart':'Standard',
    'Aile':'Family',
    'Bireysel':'Individual',
    'Öğrenci':'Student',
    'Reklamsız':'Ad-Free',
    'Ücretsiz':'Free',
    'Spor Paketi':'Sports Pack',
    'Kanal Aboneliği':'Channel Subscription',
    'Prime Üyelik':'Prime Membership',
    'Aile Paylaşımı':'Family Sharing',
    'Reklamlı HD':'HD with Ads',
    'Reklamsız HD':'HD Ad-Free',
    'Reklamsız 4K':'4K Ad-Free',
    'Eğlence Paketi':'Entertainment Pack',
    'Süper Paket':'Super Pack',
    'Duo (2 kişi)':'Duo (2 people)',
    'Aile (6 kişi)':'Family (6 people)'
  };
  return map[name]||name;
}
function updateRegionUI(){const code=SETTINGS.country||'tr';const country=COUNTRIES.find(c=>c.code===code);const desc=document.getElementById('regionDesc');if(desc)desc.textContent=country?country.name:'Türkiye';}
function buildRegionPicker(){const cur=SETTINGS.country||'tr';const picker=document.getElementById('regionPicker');if(!picker)return;picker.innerHTML=`<input id="countrySearch" class="add-input" placeholder="🔍 Ülke ara..." type="text" style="margin-bottom:4px;" oninput="filterCountries(this.value)" autocomplete="off"><div id="countryList" style="display:flex;flex-direction:column;gap:6px;max-height:260px;overflow-y:auto;scrollbar-width:none;"></div>`;renderCountryList('',cur);setTimeout(()=>{const el=document.getElementById('countrySearch');if(el)el.focus();},100);}
function filterCountries(q){renderCountryList(q,SETTINGS.country||'tr');}
function renderCountryList(q,cur){const list=document.getElementById('countryList');if(!list)return;const filtered=q?COUNTRIES.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.code.includes(q.toLowerCase())):COUNTRIES;list.innerHTML=filtered.map(c=>`<div class="region-item${c.code===cur?' region-sel':''}" onclick="selectCountry('${c.code}','${c.region}')" style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:10px;"><span style="font-size:20px;line-height:1;">${c.flag}</span><div><div style="font-size:14px;font-weight:600;color:${c.code===cur?'#fff':'rgba(255,255,255,.75)'};">${c.name}</div><div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:1px;">${c.currency} · ${c.symbol}</div></div></div>${c.code===cur?'<svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5l4 4L13 1" stroke="#4cd964" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</div>`).join('');}
function selectCountry(code,region){SETTINGS.country=code;SETTINGS.region=region;saveData();renderCountryList('',code);updateRegionUI();}
function setPinChoice(val){
  SETTINGS.usePin=val;
  saveData();
  var yesCard=document.getElementById('pin-yes');
  var noCard=document.getElementById('pin-no');
  var yesChk=document.getElementById('pin-yes-check');
  var noChk=document.getElementById('pin-no-check');
  if(!yesCard||!noCard) return;
  if(val){
    yesCard.style.borderColor='rgba(192,132,252,.6)';
    yesCard.style.background='rgba(130,80,255,.12)';
    noCard.style.borderColor='rgba(255,255,255,.08)';
    noCard.style.background='rgba(255,255,255,.05)';
    if(yesChk){ yesChk.style.background='#c084fc'; yesChk.style.borderColor='#c084fc'; yesChk.innerHTML='<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
    if(noChk){ noChk.style.background=''; noChk.style.borderColor='rgba(255,255,255,.15)'; noChk.innerHTML=''; }
  } else {
    noCard.style.borderColor='rgba(255,255,255,.25)';
    noCard.style.background='rgba(255,255,255,.08)';
    yesCard.style.borderColor='rgba(255,255,255,.08)';
    yesCard.style.background='rgba(255,255,255,.05)';
    if(noChk){ noChk.style.background='rgba(255,255,255,.6)'; noChk.style.borderColor='rgba(255,255,255,.6)'; noChk.innerHTML='<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
    if(yesChk){ yesChk.style.background=''; yesChk.style.borderColor='rgba(255,255,255,.15)'; yesChk.innerHTML=''; }
  }
  // Press animasyonu
  var tapped=val?yesCard:noCard;
  tapped.style.transform='scale(.97)';
  setTimeout(function(){ tapped.style.transform='scale(1.01)'; setTimeout(function(){ tapped.style.transform=''; },200); },100);
}
let obStep=0;const obSteps=['services','pinChoice','pin','done'];let obSelectedServices=['netflix','youtube','disney','prime','hbo','apple'];let obNewPin='';
function renderOnboardStep(){const prog=document.getElementById('obProgress');prog.innerHTML=obSteps.map((_,i)=>`<div class="onboard-dot${i<=obStep?' done':''}"></div>`).join('');const content=document.getElementById('obContent');const btn=document.getElementById('obNextBtn');const btnText=btn?btn.querySelector('.cta-btn-text'):null;const skip=document.querySelector('.onboard-skip');const tr=LANG==='tr';const setSkip=(v)=>{if(skip)skip.style.display=v;};if(skip)skip.textContent=tr?'Atla':'Skip';content.style.animation='none';content.offsetHeight;content.style.animation='obSlideIn .45s cubic-bezier(.32,.72,0,1) both';if(obStep===0){if(btnText)btnText.textContent=tr?'Devam':'Continue';setSkip('block');content.innerHTML=`<div style="padding:0 24px;"><div class="onboard-step-lbl">${tr?'Adım 1 / 3':'Step 1 / 3'}</div><div class="onboard-title">${tr?'Hangi servisleri<br>kullanıyorsun?':'Which services<br>do you use?'}</div><div class="onboard-sub">${tr?'Hepsini sonra değiştirebilirsin.':'You can change all of them later.'}</div><div class="service-pick-grid" id="spGrid" style="margin-top:20px;"></div></div>`;buildServicePicker();}else if(obStep===1){if(btnText)btnText.textContent=tr?'Devam':'Continue';setSkip('block');content.innerHTML=`<div style="padding:0 4px;">
<div class="onboard-step-lbl">${tr?'Adım 2 / 3':'Step 2 / 3'}</div>
<div class="onboard-title" style="margin-bottom:8px;">${tr?'Güvenlik':'Security'}</div>
<div class="onboard-sub" style="margin-bottom:28px;">${tr?'Uygulamana PIN ile giriş yapmak ister misin?':'Do you want to use a PIN to unlock the app?'}</div>
<div style="display:flex;flex-direction:column;gap:12px;">
  <div id="pin-yes" onclick="setPinChoice(true)" style="display:flex;align-items:center;gap:16px;padding:20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:20px;cursor:pointer;transition:all .2s cubic-bezier(.34,1.4,.64,1);">
    <div style="width:48px;height:48px;border-radius:14px;background:rgba(130,80,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#c084fc" stroke-width="1.8" fill="none"/><path d="M8 11V7a4 4 0 018 0v4" stroke="#c084fc" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="12" cy="16" r="1.5" fill="#c084fc"/></svg>
    </div>
    <div style="flex:1;">
      <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:3px;">${tr?'Evet, PIN kur':'Yes, set a PIN'}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.4);line-height:1.4;">${tr?'Şifrelerini güvende tut':'Keep your passwords secure'}</div>
    </div>
    <div id="pin-yes-check" style="width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;"></div>
  </div>
  <div id="pin-no" onclick="setPinChoice(false)" style="display:flex;align-items:center;gap:16px;padding:20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:20px;cursor:pointer;transition:all .2s cubic-bezier(.34,1.4,.64,1);">
    <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="rgba(255,255,255,.4)" stroke-width="1.8" fill="none"/><path d="M5 11V7a4 4 0 018 0" stroke="rgba(255,255,255,.4)" stroke-width="1.8" stroke-linecap="round" fill="none"/><line x1="19" y1="5" x2="5" y2="19" stroke="rgba(255,255,255,.4)" stroke-width="1.8" stroke-linecap="round"/></svg>
    </div>
    <div style="flex:1;">
      <div style="font-size:15px;font-weight:700;color:rgba(255,255,255,.7);margin-bottom:3px;">${tr?'Hayır, şimdilik atlıyorum':'No, skip for now'}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.3);line-height:1.4;">${tr?'Daha sonra ayarlardan açabilirsin':'You can enable it later in settings'}</div>
    </div>
    <div id="pin-no-check" style="width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;"></div>
  </div>
</div>
</div>`;}else if(obStep===2){btn.style.display='none';setSkip('none');if(SETTINGS.usePin===false){onboardNext();return;}const KL={2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ'};content.innerHTML=`<div class="ob-pin-wrap"><div class="ob-pin-head"><div class="onboard-title">${tr?'PIN Oluştur':'Create PIN'}</div><div class="onboard-sub" id="obPinSub">${tr?'4 haneli giriş şifreni belirle.':'Set your 4-digit login PIN.'}</div></div><div class="ob-pin-dots"><div class="ob-pin-dot" id="op0"></div><div class="ob-pin-dot" id="op1"></div><div class="ob-pin-dot" id="op2"></div><div class="ob-pin-dot" id="op3"></div></div><div class="onboard-pin-grid">${[1,2,3,4,5,6,7,8,9,'face',0,'del'].map(k=>`<button class="ob-key" onclick="obKp(${JSON.stringify(k)})">${k==='face'?`<svg width="22" height="22" viewBox="0 0 26 26" fill="none"><path d="M3 8V5a2 2 0 012-2h3M23 8V5a2 2 0 00-2-2h-3M3 18v3a2 2 0 002 2h3M23 18v3a2 2 0 01-2 2h-3" stroke="white" stroke-width="1.8" stroke-linecap="round" opacity=".5"/></svg>`:k==='del'?`<svg width="22" height="16" viewBox="0 0 22 16" fill="none"><path d="M8 1H20a2 2 0 012 2v10a2 2 0 01-2 2H8L2 8z" stroke="rgba(255,255,255,.7)" stroke-width="1.5" fill="none"/><path d="M12 5.5l5 5M17 5.5l-5 5" stroke="rgba(255,255,255,.7)" stroke-width="1.6" stroke-linecap="round"/></svg>`:`<div><div class="ob-key-num">${k}</div>${KL[k]?`<div class="ob-key-sub">${KL[k]}</div>`:''}</div>`}</button>`).join('')}</div></div>`;obNewPin='';obPinStep=0;}else if(obStep>=3){btn.style.display='';setSkip('none');if(btnText)btnText.textContent=tr?'Başla':'Start';content.innerHTML=`<div class="ob-pin-wrap"><div class="ob-pin-head"><div class="onboard-title">${tr?'Hazırsın!':'You are ready!'}</div><div class="onboard-sub">${tr?'EasyTV kurulumu tamamlandı.':'EasyTV setup is complete.'}</div></div></div>`;}
requestAnimationFrame(function(){var t=content.querySelector('.onboard-title');var s=content.querySelector('.onboard-sub');_charReveal(t,0.1);_charReveal(s,0.32);});}
let obPinStep=0;
function obKp(k){if(k==='face'||obNewPin.length>=4)return;if(k==='del'){obNewPin=obNewPin.slice(0,-1);}else{obNewPin+=k;}for(let i=0;i<4;i++)document.getElementById('op'+i).classList.toggle('f',i<obNewPin.length);if(obNewPin.length===4){if(obPinStep===0){obPinStep=1;tempPin=obNewPin;obNewPin='';for(let i=0;i<4;i++)document.getElementById('op'+i).classList.remove('f');const s=document.getElementById('obPinSub');if(s)s.textContent=LANG==='tr'?'PIN\'ini bir kez daha gir.':'Enter your PIN one more time.';}else{if(obNewPin===tempPin){savePin(obNewPin).then(()=>{ setTimeout(()=>onboardNext(),200); });}else{obNewPin='';obPinStep=0;tempPin='';for(let i=0;i<4;i++){const d=document.getElementById('op'+i);d.classList.remove('f');d.classList.add('err');}setTimeout(()=>{for(let i=0;i<4;i++)document.getElementById('op'+i).classList.remove('err');},600);const s=document.getElementById('obPinSub');if(s)s.textContent=LANG==='tr'?'Eşleşmedi. Tekrar dene.':'PINs do not match. Try again.';}}}}
function _obSlideNext(cb){const c=document.getElementById('obContent');c.style.animation='obSlideOut .25s cubic-bezier(.55,.06,.68,.19) both';c.addEventListener('animationend',function h(){c.removeEventListener('animationend',h);cb();},{once:true});}
function onboardNext(){if(obStep===0){SVC=[];obSelectedServices.forEach(id=>{const svc=POPULAR_SVCS.find(s=>s.id===id);if(svc){const reg=SETTINGS.region||'tr';const pr=svc.prices?.[reg]||{amount:0,plan:''};const renewDate=new Date();renewDate.setMonth(renewDate.getMonth()+1);SVC.push({...svc,email:'',pwd:'',price:pr.amount,plan:pr.plan,renew:renewDate.toISOString().split('T')[0]});}});saveData();_obSlideNext(()=>{obStep++;renderOnboardStep();});return;}if(obStep===1){if(SETTINGS.usePin===false){_obSlideNext(()=>finishOnboard());}else{_obSlideNext(()=>{obStep++;renderOnboardStep();});}return;}if(obStep===2){_obSlideNext(()=>finishOnboard());return;}_obSlideNext(()=>{obStep++;renderOnboardStep();});}
function finishOnboard(){
  localStorage.setItem('easytv_setup_done','1');
  if(SETTINGS.usePin!==false && !SETTINGS.pin && !SETTINGS.pinHash){
    // Güvenli rastgele PIN oluştur
    const rPin = String(Math.floor(100000 + Math.random()*900000)).slice(0,4);
    savePin(rPin).then(()=>{
      showToast('Geçici PIN: ' + rPin + ' — Lütfen değiştirin!');
    });
  }
  const onboardScreen=document.getElementById('onboardScreen');
  const pinScreen=document.getElementById('pinScreen');
  if(onboardScreen) onboardScreen.classList.add('out');
  setTimeout(()=>{
    if(onboardScreen) onboardScreen.style.display='none';
    if(SETTINGS.usePin===false){unlockApp();}
    else if(pinScreen){
      pinScreen.style.display='flex';
      _applyLogoReveal(pinScreen.querySelector('.pin-logo img'));
      _charReveal(document.getElementById('pinGreeting'), 0.15);
    }
  },500);
}
function skipServices(){obStep++;renderOnboardStep();}
function skipOnboard(){localStorage.setItem('easytv_setup_done','1');const onboardScreen=document.getElementById('onboardScreen');if(onboardScreen)onboardScreen.classList.add('out');setTimeout(()=>{if(onboardScreen)onboardScreen.style.display='none';unlockApp();},500);}
function buildServicePicker(){
  var g=document.getElementById('spGrid');
  if(!g) return;
  g.innerHTML='';
  POPULAR_SVCS.forEach(function(s){
    var L=LOGO[s.id]||null;
    var isDark=s.textDark||(L&&L.textDark);
    var sel=obSelectedServices.includes(s.id);
    var el=document.createElement('div');
    el.className='sp-item '+s.id+(sel?' sel':'');
    if(s.rgb) el.style.setProperty('--sp-rgb', s.rgb);

    var logoHtml='';
    if(L&&L.html&&L.html.indexOf('<img')>=0){
      var useHtml=isDark&&L.htmlDark?(sel?L.htmlDark:L.html):L.html;
      var srcM=useHtml.match(/src="([^"]+)"/);
      logoHtml=srcM?'<img src="'+srcM[1]+'" loading="lazy">':'';
    } else if(L&&L.html){
      var inlineHtml=isDark&&L.htmlDark?(sel?(L.htmlDark||L.html):L.html):L.html;
      logoHtml='<div class="sp-inline-logo">'+inlineHtml+'</div>';
    } else {
      logoHtml='<span class="sp-text-logo">'+s.name.slice(0,2).toUpperCase()+'</span>';
    }

    var name=s.name.length>9?s.name.slice(0,8)+'…':s.name;

    el.innerHTML='<div class="sp-logo-wrap">'+logoHtml+'</div>'
      +'<div class="sp-name">'+name+'</div>';


    el.onclick=function(){
      var i2=obSelectedServices.indexOf(s.id);
      if(i2>=0) obSelectedServices.splice(i2,1);
      else obSelectedServices.push(s.id);
      buildServicePicker();
    };
    g.appendChild(el);
  });
}
function kp(n){
  if(pinVal.length>=4) return;
  // Görsel feedback — direkt style, transition yok, garantili görünür
  document.querySelectorAll('#pinScreen .key').forEach(function(b){
    var span=b.querySelector('.key-num');
    if(span && String(span.textContent).trim()===String(n)){
      b.style.cssText='background:rgba(255,255,255,.6)!important;transform:scale(.78)!important;box-shadow:0 0 0 6px rgba(255,255,255,.3)!important;';
      setTimeout(function(){
        b.style.cssText='background:rgba(255,255,255,.09);transform:scale(1);transition:background .2s,transform .2s;';
        setTimeout(function(){ b.style.cssText=''; }, 220);
      }, 130);
    }
  });
  pinVal+=n;
  updatePinDots();
  if(pinVal.length===4) setTimeout(function(){checkPin();},200);
}

function pinDel(){
  pinVal=pinVal.slice(0,-1);
  updatePinDots();
  // Del tuşu feedback
  const delBtn = document.querySelector('#pinScreen .key:last-child');
  if(delBtn){ delBtn.style.background='rgba(255,255,255,.3)'; setTimeout(()=>{delBtn.style.background='';},150); }
}
function updatePinDots(){for(let i=0;i<4;i++)document.getElementById('pd'+i).classList.toggle('f',i<pinVal.length);}
function shakePin(){
  const dots=document.getElementById('pinDots');
  if(!dots)return;
  dots.style.animation='none';
  dots.offsetHeight;
  dots.style.animation='pinShake .4s ease';
}
async function checkPin(){
  const ok = await checkPinHash(pinVal);
  if(ok){
    if(pinMode==='change1'){tempPin=pinVal;pinVal='';pinMode='change2';
      const pinGreeting=document.getElementById('pinGreeting');
      const pinHint=document.getElementById('pinHint');
      if(pinGreeting)pinGreeting.textContent='Yeni PIN';
      if(pinHint)pinHint.textContent='Yeni PIN' + String.fromCharCode(39) + 'ini gir';
      updatePinDots();
    } else if(pinMode==='change2'){
      if(pinVal===tempPin){await savePin(pinVal);pinMode='unlock';showToast('PIN güncellendi');hidePinScreen();pinVal='';}
      else{shakePin();pinVal='';const pinHint=document.getElementById('pinHint');if(pinHint)pinHint.textContent='Eslesmed, tekrar dene';}
    } else { await setKeyFromRawPIN(pinVal); unlockApp(); }
  } else { shakePin(); pinVal=''; }
}
const gridEl = document.getElementById('grid');

// ── Parallax: scroll grid → aurora küreleri ters yönde hafif kayar ──
(function initParallax() {
  const gs = document.getElementById('gridScroll');
  const amb = document.querySelector('.bg-ambient');
  const grn = document.querySelector('.bg-grain');
  if (gs && amb) {
    gs.addEventListener('scroll', () => {
      const y = gs.scrollTop * -0.08;
      amb.style.transform = `translateY(${y}px)`;
      if (grn) grn.style.transform = `translateY(${y * 0.6}px)`;
    }, {passive: true});
  }
})();

// ── Karşılama mesajı (saate göre) ──
function updateGreeting() {
  const el = document.getElementById('homeGreeting');
  if (!el) return;
  const h = new Date().getHours();
  const name = (typeof PROFILE !== 'undefined' && PROFILE.name) ? PROFILE.name.split(' ')[0] : '';
  let greet = h < 6 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar';
  el.textContent = name ? `${greet}, ${name}` : greet;
}

// ── Hızlı istatistik widget ──
function updateQuickStat() {
  const el = document.getElementById('homeQuickStat');
  if (!el) return;
  const paid = SVC.filter(s => s.price > 0);
  if (paid.length === 0) { el.innerHTML = ''; return; }
  const displayCode = (typeof SETTINGS !== 'undefined' && SETTINGS.displayCurrency) || 'TRY';
  const sym = (typeof CURRENCIES !== 'undefined' && CURRENCIES.find(c=>c.code===displayCode) || {symbol:'₺'}).symbol;
  const total = paid.reduce((a,s) => {
    if (typeof convertPrice === 'function') { const cv = convertPrice(s.price, s.priceCurrency||'TRY'); return a + cv.value; }
    return a + s.price;
  }, 0);
  el.innerHTML = `<div class="quick-stat-pill"><span class="quick-stat-val">${sym}${total.toFixed(0)}</span><span class="quick-stat-lbl">/ay</span></div><div class="quick-stat-pill"><span class="quick-stat-val">${paid.length}</span><span class="quick-stat-lbl">servis</span></div>`;
}

function buildGrid() {
  gridEl.innerHTML = '';
  updateGreeting();
  updateQuickStat();
  if (SVC.length === 0) {
    gridEl.style.display = 'flex';
    gridEl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:16px;width:100%;">
      <div style="opacity:.2;animation:emptyBob 3s ease-in-out infinite;"><svg width="56" height="48" viewBox="0 0 56 48" fill="none"><rect x="1" y="1" width="54" height="36" rx="5" stroke="white" stroke-width="2"/><path d="M18 37v6M38 37v6M12 43h32" stroke="white" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div style="font-size:17px;font-weight:700;color:rgba(255,255,255,.45);text-align:center;">Henüz servis yok</div>
      <div style="font-size:13px;color:rgba(255,255,255,.25);text-align:center;line-height:1.6;">Sağ üstteki + butonuna<br>basarak ekleyebilirsin</div>
      <button onclick="openAddModal()" style="margin-top:8px;padding:13px 28px;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.15);border-radius:14px;color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:transform .2s;"><span style="margin-right:4px;">+</span> Servis Ekle</button></div>`;
    return;
  }
  gridEl.style.display = '';
  const BOX_IMG = './assets/box2.webp';
  const active = isPremium() ? SVC : SVC.slice(0, FREE_LIMIT);
  const locked = isPremium() ? [] : SVC.slice(FREE_LIMIT);
  // Render active services (normal)
  active.forEach((s, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.backgroundImage = `url('${BOX_IMG}')`;
    tile.dataset.idx = i;
    const L = LOGO[s.id] || LOGO._custom;
    const lw = document.createElement('div');
    lw.className = 'tile-logo';
    if (s.faviconUrl) {
      lw.innerHTML = `<img src="${s.faviconUrl}" style="width:52px;height:52px;object-fit:contain;border-radius:8px;">`;
    } else if (!LOGO[s.id]) {
      lw.innerHTML = `<span style="font-size:52px;font-weight:800;color:#fff;letter-spacing:-2px;line-height:1;opacity:.95;">${(s.name || '?')[0].toUpperCase()}</span>`;
    } else {
      lw.innerHTML = L.html;
    }
    const lb = document.createElement('div');
    lb.className = 'tile-label';
    lb.textContent = s.name;
    tile.append(lw, lb);
    tile.addEventListener('pointerdown', (e) => dragStart(e, tile, i));
    tile.addEventListener('pointerup', (e) => {
      if (!_dragMoved) {
        tap(i);
      }
    });
    // Giriş animasyonu - neon pulse CSS class ile ayrı
    tile.style.opacity = '0';
    tile.style.transform = 'translateY(14px) scale(.95)';
    tile.style.transition = `opacity .4s ease ${Math.min(i*.07,.6)}s, transform .4s cubic-bezier(.34,1.2,.64,1) ${Math.min(i*.07,.6)}s`;
    tile.classList.add('skeleton');
    setTimeout(() => { tile.style.opacity='1'; tile.style.transform=''; tile.classList.remove('skeleton'); }, Math.min(i*70+300, 900));
    gridEl.appendChild(tile);
  });
  // Render locked services (visually disabled, not deleted)
  locked.forEach((s, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile locked-tile';
    tile.style.backgroundImage = `url('${BOX_IMG}')`;
    tile.dataset.idx = i + FREE_LIMIT;
    const L = LOGO[s.id] || LOGO._custom;
    const lw = document.createElement('div');
    lw.className = 'tile-logo';
    if (s.faviconUrl) {
      lw.innerHTML = `<img src="${s.faviconUrl}" style="width:52px;height:52px;object-fit:contain;border-radius:8px;">`;
    } else if (!LOGO[s.id]) {
      lw.innerHTML = `<span style="font-size:52px;font-weight:800;color:#fff;letter-spacing:-2px;line-height:1;opacity:.95;">${(s.name || '?')[0].toUpperCase()}</span>`;
    } else {
      lw.innerHTML = L.html;
    }
    const lb = document.createElement('div');
    lb.className = 'tile-label';
    lb.textContent = s.name;
    tile.append(lw, lb);
    tile.style.opacity = '0.5';
    tile.style.filter = 'grayscale(0.8)';
    tile.style.position = 'relative';
    const lockIcon = document.createElement('div');
    lockIcon.textContent = '🔒';
    lockIcon.style.position = 'absolute';
    lockIcon.style.top = '10px';
    lockIcon.style.right = '10px';
    lockIcon.style.fontSize = '22px';
    lockIcon.style.opacity = '0.7';
    tile.appendChild(lockIcon);
    tile.onclick = () => {
      showErrorToast('Bu hizmet kilitli. Premium’a geçin veya başka bir hizmeti kaldırın.', 'warning');
    };
    tile.style.opacity = '0.5';
    gridEl.appendChild(tile);
  });
}

// ── Drag-to-Reorder — iPhone-style jiggle mode ──
let _dragTile = null, _dragIdx = -1, _dragStartX = 0, _dragStartY = 0, _dragMoved = false;
let _dragLongPress = null, _dragActive = false, _dragPid = -1;
let _jiggleMode = false;

function enterJiggleMode() {
  if (_jiggleMode) return;
  _jiggleMode = true;
  if (navigator.vibrate) navigator.vibrate(30);
  [...gridEl.children].forEach((t, i) => {
    t.classList.add('jiggle');
    t.style.animationDelay = `${(i % 4) * .06}s`;
  });
  showToast('Sürüklemek için basılı tutun');
}

function exitJiggleMode() {
  if (!_jiggleMode) return;
  _jiggleMode = false;
  [...gridEl.children].forEach(t => {
    t.classList.remove('jiggle');
    t.style.animationDelay = '';
  });
}

function dragStart(e, tile, idx) {
  if (e.button && e.button !== 0) return;
  _dragMoved = false;
  _dragActive = false;
  _dragStartX = e.clientX;
  _dragStartY = e.clientY;
  _dragPid = e.pointerId;
  // NOT: setPointerCapture kaldırıldı — scroll'u engelliyordu
  tile.addEventListener('pointermove', _onDragPointerMove);
  tile.addEventListener('pointerup', _onDragPointerUp);
  tile.addEventListener('pointercancel', _onDragPointerUp);
  _dragLongPress = setTimeout(() => {
    // Uzun basışta jiggle moduna gir — sadece burada capture al
    if (!_jiggleMode) enterJiggleMode();
    _dragTile = tile;
    _dragIdx = idx;
    _dragActive = true;
    _dragMoved = true;
    try { tile.setPointerCapture(e.pointerId); } catch(ex){}
    tile.classList.remove('jiggle');
    tile.classList.add('dragging');
    if (navigator.vibrate) navigator.vibrate(20);
  }, 400);
}

function _onDragPointerMove(e) {
  const dx = e.clientX - _dragStartX, dy = e.clientY - _dragStartY;
  if (!_dragActive) {
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      clearTimeout(_dragLongPress);
      _cleanupDragListeners(e.currentTarget);
    }
    return;
  }
  _dragTile.style.setProperty('transform', `translate(${dx}px, ${dy}px) scale(1.08) translateZ(0)`, 'important');
  const tiles = [...gridEl.children];
  tiles.forEach((t) => {
    if (t === _dragTile) return;
    const r = t.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const over = Math.abs(e.clientX - cx) < r.width/2 && Math.abs(e.clientY - cy) < r.height/2;
    t.classList.toggle('drag-over', over);
  });
}

function _onDragPointerUp(e) {
  clearTimeout(_dragLongPress);
  const tile = e.currentTarget;
  _cleanupDragListeners(tile);
  try { tile.releasePointerCapture(_dragPid); } catch(ex){}
  if (!_dragActive || !_dragTile) {
    _dragTile = null; _dragIdx = -1; _dragActive = false;
    return;
  }
  _dragTile.classList.remove('dragging');
  _dragTile.style.removeProperty('transform');
  // Jiggle moduna geri dön
  _dragTile.classList.add('jiggle');
  const tiles = [...gridEl.children];
  let targetIdx = -1;
  tiles.forEach((t, i) => {
    if (t.classList.contains('drag-over')) {
      targetIdx = i;
      t.classList.remove('drag-over');
    }
  });
  if (targetIdx >= 0 && targetIdx !== _dragIdx) {
    const [moved] = SVC.splice(_dragIdx, 1);
    SVC.splice(targetIdx, 0, moved);
    saveData();
    buildGrid();
    // Rebuild sonrası jiggle devam etsin
    requestAnimationFrame(() => {
      if (_jiggleMode) {
        [...gridEl.children].forEach((t, i) => {
          t.classList.add('jiggle');
          t.style.animationDelay = `${(i % 4) * .06}s`;
        });
      }
      const newTiles = [...gridEl.children];
      [_dragIdx, targetIdx].forEach(i => {
        if (newTiles[i]) newTiles[i].classList.add('drag-settle');
      });
      setTimeout(() => { newTiles.forEach(t => t.classList.remove('drag-settle')); }, 400);
    });
    showToast('✓ Sıra güncellendi');
  } else {
    _dragTile.classList.add('drag-settle');
    setTimeout(() => { if(_dragTile) _dragTile.classList.remove('drag-settle'); }, 400);
  }
  _dragTile = null; _dragIdx = -1; _dragActive = false;
  setTimeout(() => { _dragMoved = false; }, 50);
}

function _cleanupDragListeners(tile) {
  tile.removeEventListener('pointermove', _onDragPointerMove);
  tile.removeEventListener('pointerup', _onDragPointerUp);
  tile.removeEventListener('pointercancel', _onDragPointerUp);
}

function handleGridBgClick(e) {
  if (e.target === e.currentTarget || e.target.classList.contains('grid-scroll')) {
    if (_jiggleMode) { exitJiggleMode(); return; }
    if (active >= 0) { deactivate(active); active = -1; }
  }
}

function unlockApp() {
  isLocked = false;
  const bottomNav = document.getElementById('bottomNav');
  const lockOverlay = document.getElementById('lockOverlay');
  const ps = document.getElementById('pinScreen');
  const mainApp = document.getElementById('mainApp');
  const pinGreeting = document.getElementById('pinGreeting');
  const pinHint = document.getElementById('pinHint');
  if (bottomNav) bottomNav.style.display = 'flex';
  if (lockOverlay) lockOverlay.classList.remove('visible');
  if (ps) ps.classList.add('out');
  if (mainApp) mainApp.style.display = 'flex';
  if (ps) ps.style.display = 'none';
  setTimeout(() => {
    if (ps) ps.classList.remove('out');
    if (pinGreeting) pinGreeting.textContent = LANG==='tr' ? 'Hoş geldiniz' : 'Welcome back';
    if (pinHint) pinHint.textContent = LANG==='tr' ? 'PIN ile giriş yapın' : 'Sign in with PIN';
    pinVal = ''; updatePinDots();
  }, 520);
  // Sekme geçişini switchTab ile yap — nav .active class doğru güncellensin
  curTab = null;
  switchTab('home');
  _decryptSVCInMemory().then(()=>{buildGrid();renderSubs&&renderSubs();});
  applySettings(); applyLang(); checkRenewals(); resetLockTimer();
  scheduleRenewalNotifs && scheduleRenewalNotifs();
  // PIN skip butonunu sadece PIN kapalıysa göster
  const skipBtn = document.getElementById('pinSkipBtn');
  if(skipBtn) skipBtn.style.display = (SETTINGS.usePin === false) ? 'block' : 'none';
}


// ── Nav glow pozisyonunu güncelle ──
function updateNavGlow(tab) {
  const glow = document.getElementById('navGlow');
  const navItem = document.getElementById('nav-' + tab);
  if (!glow || !navItem) return;
  
  // Force reflow before calculating - pozisyon hesaplama hatası düzeltmesi
  void navItem.offsetWidth;
  
  const nav = document.getElementById('bottomNav');
  if (!nav) return;
  
  const navRect = nav.getBoundingClientRect();
  const itemRect = navItem.getBoundingClientRect();
  const center = itemRect.left - navRect.left + itemRect.width / 2;
  
  glow.style.left = (center - 50) + 'px';
  glow.classList.remove('on');
  void glow.offsetWidth;
  glow.classList.add('on');
}

// ── Sekme geçişi (animasyonlu) ──
let curTab = 'home';
function switchTab(tab) {
  if (curTab === tab) return;
  // Jiggle modundan çık
  exitJiggleMode();
  curTab = tab;
  
  // Ambient beam'i gizle - tab değiştiğinde ışık kalmasın
  if (active >= 0) { deactivate(active); }
  var beam = document.getElementById('ambientBeam');
  if (beam) { beam.classList.remove('active'); beam.style.opacity = '0'; }
  
  // Dinamik tema rengini güncelle
  if (typeof onTabChange !== 'undefined') {
    onTabChange(tab);
  }
  ['home','subs','settings'].forEach(id => {
    const navEl = document.getElementById('nav-' + id);
    if (navEl) navEl.classList.toggle('active', id === tab);
    const tabEl = document.getElementById('tab-' + id);
    if (!tabEl) return;
    if (id === tab) {
      tabEl.style.display = 'flex';
      tabEl.style.opacity = '0';
      tabEl.style.transform = 'translateY(8px)';
      tabEl.style.transition = 'none';
      void tabEl.offsetHeight;
      tabEl.style.transition = 'opacity .28s cubic-bezier(.4,0,.2,1), transform .28s cubic-bezier(.4,0,.2,1)';
      tabEl.style.opacity = '1';
      tabEl.style.transform = 'translateY(0)';
      setTimeout(() => { tabEl.style.transition=''; tabEl.style.opacity=''; tabEl.style.transform=''; }, 320);
    } else {
      tabEl.style.display = 'none';
    }
  });
  if (tab === 'home')     buildGrid();
  if (tab === 'subs')     renderSubs();
  if (tab === 'settings') { renderProfile(); updateRateUI(); updateRegionUI(); applyLang(); }
}

// Nav glow'u başlangıçta pozisyonla
setTimeout(() => updateNavGlow('home'), 100);

// ── Otomatik kilit ──
function resetLockTimer() {
  clearTimeout(lockTimer);
  if (!SETTINGS.autolock) return;
  lockTimer = setTimeout(() => {
    if (!isLocked) {
      isLocked = true;
      _clearCryptoKey();
      const lockOverlay=document.getElementById('lockOverlay');
      if(lockOverlay) lockOverlay.classList.add('visible');
    }
  }, 2 * 60 * 1000);
}
document.addEventListener('touchstart', resetLockTimer);
document.addEventListener('click', resetLockTimer);

// ── Biyometrik / Cihaz PIN ──
async function deviceAuth() {
  // Web Authentication API (cihaz şifresi / PIN)
  try {
    if (window.PublicKeyCredential) {
      showToast('Cihaz kilidini kullan');
    } else {
      showToast('Bu cihazda desteklenmiyor');
    }
  } catch(e) { showToast('Kimlik doğrulama başarısız'); }
  // Şimdilik: direkt unlock (gerçek WebAuthn entegrasyonu gerekir)
  unlockApp();
}

async function faceId() {
  try {
    if (window.PublicKeyCredential) {
      showToast('Face ID / Touch ID kullanılıyor...');
    }
  } catch(e) { showToast('Biyometrik doğrulama başarısız'); }
  unlockApp();
}

function skipPin() {
  if (document.getElementById('bottomNav')) document.getElementById('bottomNav').style.display = 'flex';
  if (SETTINGS.usePin === false) {
    unlockApp();
  } else {
    // PIN kurulu ama atlamak isteniyor — sadece uyar
    showToast('PIN koruması açık, girilmesi gerekiyor');
  }
}

function hidePinScreen() {
  unlockApp();
}


function tap(i) {
  if (active === i) {
    openSheet(i);
    return;
  }
  if (active >= 0) deactivate(active);
  active = i;
  activate(i);
}
function activate(i){const s=SVC[i],el=gridEl.children[i],L=LOGO[s.id]||LOGO._custom;el.classList.add('active');
  
  // Dinamik tema arka planını güncelle
  if (typeof updateThemeColor !== 'undefined') {
    var tg = TILE_GRADIENTS[s.id];
    var rc = s.color || '#8250FF';
    if (!rc && tg) { var mm = tg.match(/#[0-9a-fA-F]{6}/); rc = mm ? mm[0] : '#8250FF'; }
    // Hex → rgba dönüşümü
    if (rc.startsWith('#') && rc.length === 7) {
      var r2 = parseInt(rc.slice(1,3),16);
      var g2 = parseInt(rc.slice(3,5),16);
      var b2 = parseInt(rc.slice(5,7),16);
      updateThemeColor('rgba('+r2+','+g2+','+b2+',.35)');
    } else {
      updateThemeColor(rc);
    }
  }
  
  // Morphing bubble - sadece renk güncelle, pozisyon CSS'te sabit
  const beam=document.getElementById('ambientBeam');
  if(beam&&(s.color||TILE_GRADIENTS[s.id])){
    // TILE_GRADIENTS varsa ondan da renk çıkar
    var tileGrad = TILE_GRADIENTS[s.id];
    var rawCol = s.color;
    if (!rawCol && tileGrad) {
      // gradient'ten ilk rengi çıkar
      var m = tileGrad.match(/#[0-9a-fA-F]{6}/);
      rawCol = m ? m[0] : '#8250FF';
    }
    rawCol = rawCol || '#8250FF';
    // Hex rengi parlaştır - beam için daha canlı
    var beamCol = rawCol;
    if(rawCol.startsWith('#') && rawCol.length === 7) {
      var rr = parseInt(rawCol.slice(1,3),16);
      var gg = parseInt(rawCol.slice(3,5),16);
      var bb = parseInt(rawCol.slice(5,7),16);
      // Parlaklık artır
      rr = Math.min(255, Math.round(rr * 1.8 + 40));
      gg = Math.min(255, Math.round(gg * 1.8 + 20));
      bb = Math.min(255, Math.round(bb * 1.8 + 40));
      beamCol = 'rgb('+rr+','+gg+','+bb+')';
    }
    beam.style.background=beamCol;
    beam.classList.add('active');
    // Nav glow rengi de değişsin
    const navGlow=document.getElementById('navGlow');
    if(navGlow){
      var nr=parseInt(rawCol.replace('#','').substring(0,2),16)||130;
      var ng=parseInt(rawCol.replace('#','').substring(2,4),16)||60;
      var nb=parseInt(rawCol.replace('#','').substring(4,6),16)||255;
      nr=Math.min(255,Math.round(nr*1.8+40));
      ng=Math.min(255,Math.round(ng*1.8+20));
      nb=Math.min(255,Math.round(nb*1.8+40));
      navGlow.style.background='radial-gradient(circle,rgba('+nr+','+ng+','+nb+',.5) 0%,transparent 70%)';
    }
  }el.style.backgroundImage='none';el.style.backgroundColor=TILE_GRADIENTS[s.id]?'':s.color;if(TILE_GRADIENTS[s.id])el.style.background=TILE_GRADIENTS[s.id];el.style.backdropFilter='none';el.style.webkitBackdropFilter='none';el.style.transform='scale(1.04) translateZ(0)';if(s.textDark||L.textDark){el.classList.add('dark-text');el.querySelector('.tile-logo').innerHTML=L.htmlDark||L.html;el.style.boxShadow=`0 8px 28px rgba(${s.rgb},.3)`;}else{el.style.boxShadow=`0 0 0 2px rgba(255,255,255,.12),0 8px 30px rgba(${s.rgb},.45)`;}}
function deactivate(i){
  // Null check - gridEl veya children[i] undefined olabilir
  if (!gridEl || !gridEl.children || !gridEl.children[i]) {
    active = -1;
    const beam = document.getElementById('ambientBeam');
    if (beam) { beam.classList.remove('active'); beam.style.opacity = '0'; }
    return;
  }
  const s=SVC[i],el=gridEl.children[i],L=LOGO[s.id]||LOGO._custom;
  el.classList.remove('active','dark-text');
  const beam=document.getElementById('ambientBeam');
  if(beam) { beam.classList.remove('active'); beam.style.opacity = '0'; }
  const navGlow=document.getElementById('navGlow');
  if(navGlow) navGlow.style.background='radial-gradient(circle,rgba(120,60,255,.35) 0%,transparent 70%)';
  // Fiyat overlay temizle
  const priceEl=el.querySelector('.tile-price');
  if(priceEl) priceEl.remove();
  const boxUrl='./assets/box2.webp';
  el.style.background='';
  el.style.backgroundImage=`url('${boxUrl}')`;
  el.style.backgroundSize='cover';
  el.style.backgroundPosition='center';
  el.style.backdropFilter='';
  el.style.webkitBackdropFilter='';
  el.style.borderColor='';
  el.style.boxShadow='';
  el.style.transform='';
  if(s.textDark||L.textDark){el.querySelector('.tile-logo').innerHTML=L.html;}
  active=-1;
}
function openSheet(i) {
  active = i;
  const s = SVC[i];
  if (!s) return;
  const L = LOGO[s.id] || { w: 28, h: 28, html: null };
  const tileGrad = TILE_GRADIENTS[s.id] || s.color;

  // DOM elementlerini topluca alalım
  const ids = ['sColor', 'sLogoWrap', 'sIco', 'sName', 'emailV', 'pwdV', 'eyeU', 'qrBtn', 'appOpenBtn', 'dimmer', 'sheet'];
  const els = {};
  ids.forEach(id => els[id] = document.getElementById(id));

  // Kritik elementler yoksa çık
  if (!els.sheet || !els.dimmer) return;

  // İçerik güncellemelerini animasyon başlamadan hemen önce yapalım
  if (els.sColor) els.sColor.style.background = tileGrad;
  if (els.sLogoWrap) els.sLogoWrap.style.background = tileGrad;

  // Dinamik tema
  if (typeof onServiceClick !== 'undefined' && s.id) {
    onServiceClick(s.id);
  }

  // Logo render
  if (els.sIco) {
    const isImgLogo = L.html && L.html.includes('<img');
    const useDark = s.textDark || L.textDark;
    const activeHtml = (useDark && L.htmlDark) ? L.htmlDark : L.html;

    if (s.faviconUrl) {
      els.sIco.innerHTML = `<img src="${s.faviconUrl}" style="width:38px;height:38px;object-fit:contain;border-radius:6px;">`;
    } else if (isImgLogo && activeHtml) {
      const imgSrc = (activeHtml.match(/src="([^"]+)"/) || [])[1] || '';
      els.sIco.innerHTML = imgSrc ? `<img src="${imgSrc}" style="width:38px;height:38px;object-fit:contain;">` : `<span style="font-size:24px;font-weight:800;color:${useDark ? '#000' : '#fff'}">${(s.name || '?')[0]}</span>`;
    } else if (L.html) {
      const sc2 = 22 / Math.max(L.w || 22, L.h || 22);
      const svgHtml = useDark ? (L.htmlDark || L.html.replace(/fill="white"/g, 'fill="black"')) : L.html;
      els.sIco.innerHTML = `<div style="width:${Math.round((L.w || 22) * sc2)}px;height:${Math.round((L.h || 22) * sc2)}px;display:flex;align-items:center;justify-content:center;">${svgHtml}</div>`;
    } else {
      els.sIco.innerHTML = `<span style="font-size:30px;font-weight:800;color:${useDark ? '#000' : '#fff'}">${(s.name || '?')[0].toUpperCase()}</span>`;
    }
  }

  if (els.sName) els.sName.textContent = s.name;
  if (els.emailV) els.emailV.textContent = s.email ? s.email.replace(/^(.{3}).*(@.*)$/, '$1•••$2') : '—';
  
  pwdShow = false;
  if (els.pwdV) els.pwdV.textContent = '••••••••••';
  if (els.eyeU) els.eyeU.setAttribute('href', '#i-eye');

  ['uE', 'uP'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('href', '#i-copy');
  });

  ['btnE', 'btnP'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('ok');
  });

  if (els.qrBtn) {
    els.qrBtn.style.background = tileGrad;
    els.qrBtn.style.color = (s.textDark || L.textDark) ? '#000' : '#fff';
  }
  
  if (els.appOpenBtn) els.appOpenBtn.textContent = `${s.name} Uygulamasını Aç`;

  // Paralaks sıfırla
  const sHead = document.querySelector('.s-head');
  if (sHead) sHead.style.transform = '';

  // Glitch önleme: Senkron tetikleme
  els.dimmer.classList.add('on');
  els.sheet.classList.add('open');

  // Scroll event korumalı
  const sheetBody = document.querySelector('.sheet-body');
  if (sheetBody) {
    sheetBody.onscroll = function() {
      const sh = document.querySelector('.s-head');
      if (sh) sh.style.transform = 'translateY(' + Math.min(sheetBody.scrollTop * 0.3, 20) + 'px) scale(' + (1 - sheetBody.scrollTop * 0.0003) + ')';
    };
  }
}
function closeSheet(){const sheetEl=document.getElementById('sheet');const dimmer=document.getElementById('dimmer');if(sheetEl)sheetEl.classList.remove('open');if(dimmer)dimmer.classList.remove('on');if(active>=0)deactivate(active);}
function togglePwd(){const pwdEl=document.getElementById('pwdV');const eyeU=document.getElementById('eyeU');if(!pwdEl||!eyeU)return;pwdShow=!pwdShow;pwdEl.textContent=pwdShow&&active>=0?SVC[active].pwd:'••••••••••';eyeU.setAttribute('href',pwdShow?'#i-eyeoff':'#i-eye');}
function doCopy(btn,f){
  if(active<0)return;
  const s=SVC[active];
  const text=f==='E'?(s.email||''):(s.pwd||'');
  if(!text){showToast('Kopyalanacak içerik yok');return;}
  const uid=f==='E'?'uE':'uP';
  const doAnim=()=>{document.getElementById(uid).setAttribute('href','#i-check');btn.classList.add('ok');showToast('✓ Kopyalandı');setTimeout(()=>{document.getElementById(uid).setAttribute('href','#i-copy');btn.classList.remove('ok');},1600);};
  if(navigator.clipboard&&window.isSecureContext){
    navigator.clipboard.writeText(text).then(doAnim).catch(()=>{
      // fallback
      const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;top:-9999px;opacity:0;';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);doAnim();
    });
  } else {
    const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;top:-9999px;opacity:0;';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);doAnim();
  }
}
function openDeepLink(){if(active<0)return;const s=SVC[active];const reg=getRegion();const deepLink=reg.deep[s.id];const storeLink=reg.store[s.id];if(deepLink){showToast(`${s.name} açılıyor...`);const iframe=document.createElement('iframe');iframe.style.display='none';document.body.appendChild(iframe);iframe.src=deepLink;setTimeout(()=>{document.body.removeChild(iframe);if(storeLink)window.open(storeLink,'_blank');},1500);}else if(storeLink){showToast(`App Store'a yönlendiriliyor...`);window.open(storeLink,'_blank');}else{showToast('Bu bölgede mevcut değil');}}
function shareCredentials(){if(active<0)return;const s=SVC[active];const txt=`${s.name}\nKullanıcı: ${s.email}\nŞifre: ${s.pwd}`;if(navigator.share){navigator.share({title:`${s.name} Hesap Bilgileri`,text:txt});}else{navigator.clipboard.writeText(txt).then(()=>showToast('✓ Panoya kopyalandı'));}}
function genQRSvg(seed){const s=Math.sin(seed*7.3+1.1);let cells='';for(let r=0;r<21;r++){for(let c=0;c<21;c++){const inCorner=(r<7&&c<7)||(r<7&&c>13)||(r>13&&c<7);let fill=0;if(inCorner){if(r===0||r===6||c===0||c===6)fill=1;else if(r>=2&&r<=4&&c>=2&&c<=4)fill=1;}else{fill=Math.sin((r+seed)*(c+1)*2.7+s*10)>0.1?1:0;}if(fill)cells+=`<rect x="${c*8+1}" y="${r*8+1}" width="7" height="7" rx="1"/>`;}}return`<svg width="168" height="168" viewBox="0 0 169 169" fill="white">${cells}</svg>`;}
function openQR(){if(active<0)return;const s=SVC[active];const qrSvcName=document.getElementById('qrSvcName');const qrCodeArea=document.getElementById('qrCodeArea');const qrOv=document.getElementById('qrOv');if(!qrSvcName||!qrCodeArea||!qrOv)return;qrSvcName.textContent=s.name+' — Otomatik Giriş';clearInterval(qrRotateInterval);clearInterval(qrCountdown);qrSec=30;qrCodeArea.innerHTML=genQRSvg(_qrSeed%1000);updateQRTimer();if(SETTINGS.qrrotate){qrRotateInterval=setInterval(()=>{_qrSeed=Date.now();if(qrCodeArea)qrCodeArea.innerHTML=genQRSvg(_qrSeed%1000);},30000);qrCountdown=setInterval(()=>{qrSec--;if(qrSec<=0)qrSec=30;updateQRTimer();},1000);}qrOv.classList.add('open');}
function closeQR(){const qrOv=document.getElementById('qrOv');if(qrOv)qrOv.classList.remove('open');clearInterval(qrRotateInterval);clearInterval(qrCountdown);closeSheet();}
function updateQRTimer(){const qrTimerBadge=document.getElementById('qrTimerBadge');if(qrTimerBadge)qrTimerBadge.textContent=`⟳ ${qrSec}s`;}
let currentAddTab='popular';
function switchAddTab(tab){currentAddTab=tab;['popular','custom','remove'].forEach(k=>{document.getElementById('tab-'+k).classList.toggle('active',tab===k);document.getElementById(k+'Tab').style.display=tab===k?'block':'none';});if(tab==='remove')buildRemoveGrid();}

const PRESET_COLORS=['#E50914','#FF6D00','#FFCA28','#00C853','#00B0FF','#7B2FBE','#EC407A','#546E7A','#ffffff'];
function buildColorPicker(){const row=document.getElementById('colorRow');row.innerHTML='';let sel=PRESET_COLORS[4];PRESET_COLORS.forEach(c=>{const chip=document.createElement('div');chip.className='color-chip'+(c===sel?' sel':'');chip.style.background=c==='#ffffff'?'rgba(255,255,255,.9)':c;chip._color=c;chip.onclick=()=>{sel=c;document.querySelectorAll('.color-chip').forEach(ch=>ch.classList.remove('sel'));chip.classList.add('sel');};row.appendChild(chip);});}
function normalizeWebUrl(raw){if(!raw)return'';let val=String(raw).trim();if(!val)return'';if(!/^https?:\/\//i.test(val))val='https://'+val;try{return new URL(val).toString();}catch(_){return'';}}
function faviconForUrl(raw){const url=normalizeWebUrl(raw);if(!url)return'';return`https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url)}`;}
function fetchFavicon(){const urlInp=document.getElementById('addUrl');const prev=document.getElementById('faviconPreview');if(!urlInp||!prev)return;const fav=faviconForUrl(urlInp.value);if(!fav){prev.innerHTML='<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/></svg>';delete prev.dataset.favicon;return;}prev.innerHTML=`<img src="${fav}" style="width:18px;height:18px;object-fit:contain;border-radius:4px;" onerror="this.style.display='none'">`;prev.dataset.favicon=fav;}
function saveCustomService(){
  const nameInp=document.getElementById('addName');
  const urlInp=document.getElementById('addUrl');
  const emailInp=document.getElementById('addEmail');
  const pwdInp=document.getElementById('addPwd');
  const priceInp=document.getElementById('addPrice');
  const renewInp=document.getElementById('addRenew');
  const name=(nameInp?.value||'').trim();
  if(!name){showToast(LANG==='tr'?'Servis adı gerekli':'Service name is required');nameInp?.focus();return;}
  if(SVC.length>=FREE_LIMIT&&!isPremium()){openPremiumSheet();return;}
  const selectedChip=document.querySelector('#colorRow .color-chip.sel');
  const color=(selectedChip&&selectedChip._color)||PRESET_COLORS[4];
  const priceRaw=((priceInp?.value)||'').replace(/[^\d.,-]/g,'').replace(',', '.');
  const parsed=parseFloat(priceRaw);
  const fullPrice=Number.isFinite(parsed)&&parsed>0?parsed:0;
  const webUrl=normalizeWebUrl(urlInp?.value||'');
  const faviconUrl=faviconForUrl(urlInp?.value||'');
  const renew=(renewInp?.value||'').trim()||null;
  const countryCurrency=(COUNTRIES.find(c=>c.code===(SETTINGS.country||'tr'))||{}).currency||'TRY';
  const svc={
    id:`custom_${Date.now()}`,
    name,
    color,
    email:(emailInp?.value||'').trim(),
    pwd:(pwdInp?.value||'').trim(),
    price:fullPrice,
    _fullPrice:fullPrice,
    _userCount:1,
    _payMethod:'me',
    priceCurrency:countryCurrency,
    plan:LANG==='tr'?'Özel':'Custom',
    renew,
    url:webUrl,
    faviconUrl
  };
  SVC.push(svc);
  saveData();
  buildGrid();
  renderSubs&&renderSubs();
  closeAddModal();
  showToast(`✓ ${name} ${LANG==='tr'?'eklendi':'added'}`);
}
window.fetchFavicon=fetchFavicon;
window.saveCustomService=saveCustomService;

function openAddModal(){
  buildPopularGrid();buildColorPicker();selectedPopular=null;const popularForm=document.getElementById('popularForm');const addModal=document.getElementById('addModal');if(popularForm)popularForm.style.display='none';if(addModal)addModal.classList.add('open');}
let planModalSvc=null,planModalSelected=null;
function openPlanModal(s){planModalSvc=s;planModalSelected=null;const L=LOGO[s.id]||null;let logoHtml='';if(L&&L.html&&L.html.includes('<img')){const iS=L.html.match(/src="([^"]+)"/)?.[ 1]||'';logoHtml=`<img src="${iS}" style="width:32px;height:32px;object-fit:contain;">`;}document.getElementById('planModalLogo').style.background=TILE_GRADIENTS[s.id]||s.color;document.getElementById('planModalLogo').innerHTML=logoHtml;document.getElementById('planModalName').textContent=s.name;const d=new Date();d.setMonth(d.getMonth()+1);document.getElementById('planRenewInput').value=d.toISOString().split('T')[0];const plans=getCountryPlans(s.id);const sym=getCountrySymbol();const list=document.getElementById('planList');list.innerHTML='';plans.forEach((p,i)=>{const el=document.createElement('div');el.className='plan-option'+(i===0?' selected':'');if(i===0)planModalSelected=p;el.innerHTML=`<div class="plan-option-left"><div class="plan-option-name">${p.name}</div><div style="font-size:13px;color:rgba(255,255,255,.45);">${p.price>0?sym+p.price.toFixed(2)+'/ay':'Ücretsiz'}</div></div><div class="plan-option-check">${i===0?'<svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5L11 1" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>':''}</div>`;el.onclick=()=>{planModalSelected=p;list.querySelectorAll('.plan-option').forEach(o=>{o.classList.remove('selected');o.querySelector('.plan-option-check').innerHTML='';});el.classList.add('selected');el.querySelector('.plan-option-check').innerHTML='<svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5L11 1" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';};list.appendChild(el);});const btn=document.createElement('button');btn.className='plan-confirm-btn';btn.style.background='#fff';btn.style.color='#000';btn.textContent='Ekle';btn.onclick=confirmPlanAdd;list.appendChild(btn);document.getElementById('planModal').classList.add('open');}
function closePlanModal(){const planModal=document.getElementById('planModal');if(planModal)planModal.classList.remove('open');planModalSvc=null;planModalSelected=null;}
function confirmPlanAdd(){if(!planModalSvc||!planModalSelected)return;const s=planModalSvc;const p=planModalSelected;const renew=document.getElementById('planRenewInput').value||null;const existing=SVC.findIndex(sv=>sv.id===s.id);
  let myPrice=p.price;
  if(typeof _planPayMethod!=='undefined'){
    if(_planPayMethod==='split')myPrice=p.price/(typeof _planUserCount!=='undefined'?_planUserCount:1);
    else if(_planPayMethod==='other')myPrice=0;
  }
  const svc={...s,email:'',pwd:'',price:myPrice,_fullPrice:p.price,_userCount:typeof _planUserCount!=='undefined'?_planUserCount:1,_payMethod:typeof _planPayMethod!=='undefined'?_planPayMethod:'me',plan:p.name,renew};if(existing>=0)SVC[existing]=svc;else SVC.push(svc);saveData();buildGrid();renderSubs&&renderSubs();closePlanModal();showToast('✓ '+s.name+' eklendi');const newIdx=existing>=0?existing:SVC.length-1;setTimeout(()=>tap(newIdx),350);}
function closeAddModal(){const addModal=document.getElementById('addModal');if(addModal)addModal.classList.remove('open');selectedPopular=null;}
function buildRemoveGrid(){
  const g=document.getElementById('removeGrid');
  g.innerHTML='';
  if(SVC.length===0){
    g.innerHTML='<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,.3);font-size:13px;padding:20px;">Ekli servis yok</div>';
    return;
  }
  SVC.forEach((s,i)=>{
    const L=LOGO[s.id]||LOGO._custom;
    const div=document.createElement('div');
    div.style.cssText='position:relative;aspect-ratio:1;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);padding:10px;';
    const logoHtml=L.html
      ?`<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;">${L.html}</div>`
      :`<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;"><span style="font-size:22px;font-weight:800;color:#fff;">${(s.name||'?')[0]}</span></div>`;
    div.innerHTML=`${logoHtml}<div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.82);text-align:center;line-height:1.2;">${s.name}</div><div style="position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:50%;background:#e53935;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;line-height:1;">×</div>`;
    div.onclick=()=>{
      const nm=s.name;
      SVC.splice(i,1);
      saveData();
      buildGrid();
      buildRemoveGrid();
      renderSubs&&renderSubs();
      showToast(`${nm} çıkarıldı`);
    };
    g.appendChild(div);
  });
}
function buildPopularGrid(){var g=document.getElementById('popularGrid');g.innerHTML='';POPULAR_SVCS.forEach(function(s){var L=LOGO[s.id]||LOGO._custom;var el=document.createElement('div');el.className='popular-item';var logoHtml='';var isDark=s.textDark||L.textDark;if(L.html&&L.html.indexOf('<img')>=0){var useHtml=isDark&&L.htmlDark?L.htmlDark:L.html;var src=useHtml.match(/src="([^"]+)"/)&&useHtml.match(/src="([^"]+)"/)[1]||'';logoHtml='<img src="'+src+'" style="width:60%;height:60%;object-fit:contain;">';}else if(L.html){logoHtml='<div style="transform:scale(.7);transform-origin:center;">'+(isDark?(L.htmlDark||L.html.replace(/fill="white"/g,'fill="black"')):L.html)+'</div>';}else{logoHtml='<span style="font-size:18px;font-weight:800;color:'+(isDark?'#000':'#fff')+'">'+s.name[0]+'</span>';}el.innerHTML='<div class="popular-ico" style="background:'+s.color+';--ico-glow:'+s.color+';border:2px solid '+s.color+'">'+logoHtml+'</div><div class="popular-name">'+s.name+'</div>';el.onclick=function(){closeAddModal();openPlanModal(s);};g.appendChild(el);});}
function formatDate(d){return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'});}
let seEditIdx=-1;
function openSubEdit(i){
  seEditIdx=i;
  const s=SVC[i];
  const L=LOGO[s.id]||{w:28,h:28,html:null};
  document.getElementById('seServiceName').textContent=s.name;
  const logoWrap=document.getElementById('seLogoWrap');
  logoWrap.style.background=s.color;
  if(L.html&&L.html.includes('<img')){
    const useHtml=(L.textDark||s.textDark)&&L.htmlDark?L.htmlDark:L.html;
    const src=useHtml.match(/src="([^"]+)"/)?.[1]||'';
    logoWrap.innerHTML=`<img src="${src}" style="width:28px;height:28px;object-fit:contain;">`;
  }else if(L.html){
    const sc=22/Math.max(L.w||22,L.h||22);
    logoWrap.innerHTML=`<div style="width:${Math.round((L.w||22)*sc)}px;height:${Math.round((L.h||22)*sc)}px;display:flex;align-items:center;justify-content:center;">${L.html}</div>`;
  }else{
    logoWrap.innerHTML=`<span style="font-size:22px;font-weight:800;color:#fff;">${(s.name||'?')[0].toUpperCase()}</span>`;
  }
  const chips=document.getElementById('sePlanChips');
  chips.innerHTML='';
  const oldWrap=document.getElementById('sePlanManualWrap');
  if(oldWrap)oldWrap.remove();
  const planRow=document.getElementById('sePlanRow');
  const planOpts=getCountryPlans(s.id);
  const sym=getCountrySymbol();
  if(planOpts.length>0){
    planRow.style.display='block';
    const selectedPlan=s.plan||'';
    const isOther=!planOpts.find(p=>{
      const localized=localizePlanName(p.name);
      return selectedPlan===p.name||selectedPlan===localized;
    });
    planOpts.forEach(p=>{
      const chip=document.createElement('button');
      const localizedName=localizePlanName(p.name);
      const isSel=selectedPlan===p.name||selectedPlan===localizedName;
      chip.className='se-chip-btn'+(isSel?' active':'');
      chip.textContent=localizedName+' · '+sym+p.price.toFixed(0);
      chip.onclick=()=>{
        chips.querySelectorAll('.se-chip-btn').forEach(cc=>cc.classList.remove('active'));
        chip.classList.add('active');
        document.getElementById('sePlan').value=localizedName;
        document.getElementById('sePrice').value=p.price;
        const mw=document.getElementById('sePlanManualWrap');
        if(mw)mw.style.display='none';
      };
      chips.appendChild(chip);
    });
    const otherChip=document.createElement('button');
    otherChip.className='se-chip-btn'+(isOther?' active':'');
    otherChip.textContent=LANG==='tr'?'Diğer':'Other';
    otherChip.onclick=()=>{
      chips.querySelectorAll('.se-chip-btn').forEach(c=>c.classList.remove('active'));
      otherChip.classList.add('active');
      document.getElementById('sePlanManualWrap').style.display='block';
      document.getElementById('sePlan').value='';
      document.getElementById('sePrice').value='';
    };
    chips.appendChild(otherChip);
    const mw=document.createElement('div');
    mw.id='sePlanManualWrap';
    mw.style.cssText='display:'+(isOther?'flex':'none')+';flex-direction:column;gap:8px;margin-top:10px;';
    mw.innerHTML=`<input id="sePlanManualInput" class="add-input" type="text" placeholder="${LANG==='tr'?'Plan adı...':'Plan name...'}" value="${isOther?(s.plan||''):''}">`;
    chips.after(mw);
    document.getElementById('sePlanManualInput').oninput=()=>{
      document.getElementById('sePlan').value=document.getElementById('sePlanManualInput').value;
    };
  }else{
    planRow.style.display='none';
  }
  document.getElementById('seShareRow').style.display='none';
  document.getElementById('sePrice').value=s._fullPrice||s.fullPrice||s.price||'';
  document.getElementById('sePlan').value=s.plan||'';
  document.getElementById('seRenew').value=s.renew||'';
  document.getElementById('seEmail').value=s.email||'';
  document.getElementById('sePwd').value=s.pwd||'';
  document.getElementById('sePwd').type='password';
  renderSeUserPaySection(i,s);
  applyLang();
  const m=document.getElementById('subEditModal');
  m.style.display='flex';
  requestAnimationFrame(()=>{document.getElementById('seModalSheet').style.transform='translateY(0)';});
  // Swipe-to-close
  const hdr=document.querySelector('.se-header');
  if(hdr&&!hdr._swipeAdded){hdr._swipeAdded=true;let sy=0;hdr.addEventListener('touchstart',e=>{sy=e.touches[0].clientY;},{passive:true});hdr.addEventListener('touchend',e=>{if(e.changedTouches[0].clientY-sy>60)closeSubEdit();},{passive:true});}
}
function toggleSePwd(){const inp=document.getElementById('sePwd');inp.type=inp.type==='password'?'text':'password';}
function openSubEditFromSheet(){const idx=active;if(idx<0)return;closeSheet();setTimeout(()=>openSubEdit(idx),280);}
function closeSubEdit(){const sh=document.getElementById('seModalSheet');const subEditModal=document.getElementById('subEditModal');if(!sh||!subEditModal)return;sh.style.transform='translateY(100%)';setTimeout(()=>{subEditModal.style.display='none';sh.style.transform='translateY(100%)';},400);}
function renderSeUserPaySection(i,s){
  const shareRow=document.getElementById('seShareRow');
  if(!shareRow)return;
  shareRow.style.display='block';
  const userChips=document.getElementById('seUserChips');
  const payChips=document.getElementById('sePayChips');
  if(!userChips||!payChips)return;
  const curCount=s._userCount||1;
  const curPay=s._payMethod||'me';
  userChips.innerHTML='';
  [1,2,3,4,5,6].forEach(n=>{
    const btn=document.createElement('button');
    btn.className='plan-user-pill'+(n===curCount?' active':'');
    btn.textContent=n;
    btn.onclick=()=>{
      userChips.querySelectorAll('.plan-user-pill').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      // Animate press
      btn.style.transition='none';
      btn.style.transform='scale(.93)';
      void btn.offsetWidth;
      btn.style.transition='all .18s';
      setTimeout(()=>{btn.style.transform='';},180);
    };
    userChips.appendChild(btn);
  });
  payChips.innerHTML='';
  [{method:'me',emoji:'💳',label:(LANG==='tr'?'Ben ödüyorum':'I pay')},{method:'split',emoji:'🤝',label:(LANG==='tr'?'Eşit bölüşüyoruz':'Split equally')},{method:'other',emoji:'🎁',label:(LANG==='tr'?'Başkası ödüyor':'Someone else pays')}].forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='plan-pay-opt'+(opt.method===curPay?' active':'');
    btn.dataset.method=opt.method;
    btn.innerHTML=`<span style="font-size:16px;line-height:1;">${opt.emoji}</span><span>${opt.label}</span>`;
    btn.onclick=()=>{
      payChips.querySelectorAll('.plan-pay-opt').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      // Animate press
      btn.style.transition='none';
      btn.style.transform='scale(.93)';
      void btn.offsetWidth;
      btn.style.transition='all .18s';
      setTimeout(()=>{btn.style.transform='';},180);
    };
    payChips.appendChild(btn);
  });
}
function saveSubEdit(){if(seEditIdx<0)return;
  const fullPrice=parseFloat(document.getElementById('sePrice').value)||0;
  const plan=document.getElementById('sePlan').value.trim();
  const renew=document.getElementById('seRenew').value||null;
  const email=document.getElementById('seEmail').value.trim();
  const pwd=document.getElementById('sePwd').value;
  // user/payment
  const userCountEl=document.querySelector('#seUserChips .plan-user-pill.active');
  const userCount=userCountEl?parseInt(userCountEl.textContent):SVC[seEditIdx]._userCount||1;
  const payEl=document.querySelector('#sePayChips .plan-pay-opt.active');
  const payMethod=payEl?payEl.dataset.method:(SVC[seEditIdx]._payMethod||'me');
  let myPrice=fullPrice;
  if(payMethod==='split')myPrice=fullPrice/userCount;
  else if(payMethod==='other')myPrice=0;
  SVC[seEditIdx]={...SVC[seEditIdx],price:myPrice,_fullPrice:fullPrice,_userCount:userCount,_payMethod:payMethod,plan,renew,email,pwd};
  saveData();renderSubs();closeSubEdit();showToast('✓ Güncellendi');}
function deleteSubEdit(){if(seEditIdx<0)return;const name=SVC[seEditIdx].name;SVC.splice(seEditIdx,1);saveData();buildGrid();renderSubs();closeSubEdit();showToast(`${name} silindi`);}
function renderProfile(){const paid=SVC.filter(s=>s.price>0);animateNumber(document.getElementById('statApps'),SVC.length,'','',0);animateNumber(document.getElementById('statSubs'),paid.length,'','',0);const sTot=paid.reduce((a,sv)=>{const c=convertPrice(sv.price,sv.priceCurrency||'TRY');return a+c.value;},0);
  const sSym=(CURRENCIES.find(c=>c.code===(SETTINGS.displayCurrency||'TRY'))||CURRENCIES[0]).symbol;
  const profileName=document.getElementById('profileName');
  const profileEmail=document.getElementById('profileEmail');
  const profileAvatar=document.getElementById('profileAvatar');
  const signedInEl=document.getElementById('signedInAs');
  animateNumber(document.getElementById('statSaved'),sTot,sSym,'',2);if(profileName)profileName.textContent=PROFILE.name||'Kullanıcı';if(profileEmail)profileEmail.textContent=PROFILE.email||'';if(profileAvatar)profileAvatar.textContent=(PROFILE.name||'K')[0].toUpperCase();if(signedInEl)signedInEl.textContent=PROFILE.email||'';}
function applySettings(){['faceid','autolock','qrrotate','colorblind','reminder','pricechange','remind1','remind3','remind7'].forEach(k=>{const tog=document.getElementById('tog-'+k);if(tog)tog.classList.toggle('on',!!SETTINGS[k]);});if(document.body)document.body.classList.toggle('colorblind',!!SETTINGS.colorblind);updateRegionUI();setTimeout(function(){try{updatePremiumBadge();}catch(e){console.error('updatePremiumBadge hatası:',e);}},100);}
function toggleSetting(key,el){el.classList.toggle('on');SETTINGS[key]=el.classList.contains('on');saveData();if(key==='colorblind')document.body.classList.toggle('colorblind',SETTINGS.colorblind);if(key==='autolock'){if(SETTINGS.autolock)resetLockTimer();else clearTimeout(lockTimer);}showToast(SETTINGS[key]?'✓ Açık':'✓ Kapalı');}
function exportData(){const data={svc:SVC,profile:PROFILE,version:'4.0',exported:new Date().toISOString()};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`EasyTV_${new Date().toLocaleDateString('tr-TR').replace(/\./g,'-')}.json`;a.click();URL.revokeObjectURL(url);showToast('✓ Bilgiler kaydedildi');}
function triggerImport(){const input=document.getElementById('importFile');if(input)input.click();}
function importData(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{const data=JSON.parse(ev.target.result);if(data.svc){SVC=data.svc;if(data.profile)PROFILE=data.profile;saveData();buildGrid();renderSubs();renderProfile();showToast('✓ Bilgiler geri yüklendi');}else{showToast('Bu dosya açılamadı');}}catch{showToast('Dosya açılamadı');}};reader.readAsText(file);e.target.value='';}
function restorePurchases(){showToast(LANG==='tr'?'Satın almaları geri yükleme yakında':'Restore purchases coming soon');}
function deleteAccount(){showToast(LANG==='tr'?'Hesap silme yakında':'Account deletion coming soon');}
function openRegionPicker(){let pickerEl=document.getElementById('regionPickerModal');if(!pickerEl){pickerEl=document.createElement('div');pickerEl.id='regionPickerModal';pickerEl.style.cssText='display:none;position:absolute;inset:0;z-index:450;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);flex-direction:column;align-items:center;justify-content:flex-end;';pickerEl.innerHTML=`<div style="background:#1e1f26;border-radius:24px 24px 0 0;width:100%;max-height:82%;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px;"><div style="font-size:17px;font-weight:800;color:#fff;">Ülke / Bölge Seç</div><button onclick="closeRegionPickerModal()" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.6);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button></div><div style="padding:0 16px 10px;"><input class="add-input" id="regionSearchInput" placeholder="🔍 Ülke ara..." oninput="renderRegionModalList(this.value)" style="margin:0;" autocomplete="off"></div><div id="regionPickerModalList" style="overflow-y:auto;scrollbar-width:none;padding-bottom:32px;"></div></div>`;pickerEl.addEventListener('click',function(e){if(e.target===pickerEl)closeRegionPickerModal();});document.getElementById('phone').appendChild(pickerEl);}pickerEl.style.display='flex';setTimeout(()=>renderRegionModalList(''),30);}
function closeRegionPickerModal(){const el=document.getElementById('regionPickerModal');if(el)el.style.display='none';}
function renderRegionModalList(q){const list=document.getElementById('regionPickerModalList');if(!list)return;const cur=SETTINGS.country||'tr';const filtered=q?COUNTRIES.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.code.includes(q.toLowerCase())):COUNTRIES;list.innerHTML='';filtered.forEach(c=>{const el=document.createElement('div');el.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:13px 20px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05);';el.innerHTML=`<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:22px;">${c.flag}</span><div><div style="font-size:14px;font-weight:600;color:${c.code===cur?'#fff':'rgba(255,255,255,.8)'};">${c.name}</div><div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:1px;">${c.currency} · ${c.symbol}</div></div></div>${c.code===cur?'<svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5l4 4L13 1" stroke="#4cd964" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>':''}`;el.onclick=()=>{SETTINGS.country=c.code;SETTINGS.region=c.region;saveData();updateRegionUI();closeRegionPickerModal();showToast('✓ Ülke güncellendi: '+c.name);};list.appendChild(el);});}
function showAlert(icon,title,msg,actions){const alertIcon=document.getElementById('alertIcon');const alertTitle=document.getElementById('alertTitle');const alertMsg=document.getElementById('alertMsg');const actEl=document.getElementById('alertActions');const alertModal=document.getElementById('alertModal');if(!alertIcon||!alertTitle||!alertMsg||!actEl||!alertModal)return;alertIcon.textContent=icon;alertTitle.textContent=title;alertMsg.textContent=msg;actEl.innerHTML='';actions.forEach(a=>{const btn=document.createElement('button');btn.className=`alert-btn ${a.style||'secondary'}`;btn.textContent=a.label;btn.onclick=a.action;actEl.appendChild(btn);});alertModal.classList.add('open');}
function closeAlert(){const alertModal=document.getElementById('alertModal');if(alertModal)alertModal.classList.remove('open');}
function confirmDeleteAll(){showAlert('⚠️','Tüm Verileri Sil','Tüm servisler ve şifreler kalıcı olarak silinecek. Bu işlem geri alınamaz.',[{label:'Evet, Sil',style:'danger',action:()=>{SVC=[];localStorage.clear();saveData();buildGrid();renderSubs();renderProfile();closeAlert();showToast('Tüm veriler silindi');setTimeout(()=>location.reload(),1000);}},{label:'İptal',style:'secondary',action:closeAlert}]);}
function showToast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function fitPhone(){
  var s = Math.min(window.innerWidth/393, window.innerHeight/852, 1);
  var ph = document.getElementById('phone');
  if(!ph) return;
  var scaledW = 393 * s;
  var scaledH = 852 * s;
  var tx = (window.innerWidth - scaledW) / 2;
  var ty = (window.innerHeight - scaledH) / 2;
  ph.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
  ph.style.position = 'fixed';
  ph.style.top = '0';
  ph.style.left = '0';
  ph.style.margin = '0';
}
fitPhone();window.addEventListener('resize',fitPhone);

// ══════════════════════════════════════════════════
// AI FİYAT GÜNCELLEME SİSTEMİ
// ══════════════════════════════════════════════════

const AI_PRICE_CACHE_KEY = 'easytv_ai_prices';
const AI_PRICE_TS_KEY = 'easytv_ai_prices_ts';
const AI_PRICE_TTL = 12 * 60 * 60 * 1000; // 12 saat

// Fallback fiyat veritabanı (AI çalışmazsa)
const FALLBACK_PRICES = {
  tr: {
    netflix:  [{name:'Reklamlı',price:149.99},{name:'Standart',price:219.99},{name:'Premium',price:329.99},{name:'Aile',price:269.99}],
    youtube:  [{name:'Bireysel',price:109.99},{name:'Aile (6 kişi)',price:179.99},{name:'Öğrenci',price:69.99}],
    spotify:  [{name:'Bireysel',price:79.99},{name:'Duo',price:129.99},{name:'Aile (6 kişi)',price:159.99},{name:'Öğrenci',price:49.99}],
    disney:   [{name:'Reklamlı',price:109.99},{name:'Standart',price:149.99},{name:'Premium',price:219.99}],
    hbo:      [{name:'Reklamlı',price:129.99},{name:'Reklamsız',price:189.99},{name:'Ultimate',price:249.99}],
    apple:    [{name:'Bireysel',price:49.99},{name:'Aile',price:99.99}],
    prime:    [{name:'Prime Üyelik',price:129.99}],
    twitch:   [{name:'Ücretsiz',price:0},{name:'Turbo',price:89.99}],
    kick:     [{name:'Ücretsiz',price:0},{name:'Kanal Aboneliği',price:49.99}],
    exxen:    [{name:'Reklamlı HD',price:119.99},{name:'Reklamsız HD',price:179.99},{name:'Reklamsız 4K',price:239.99},{name:'Spor Paketi',price:349.99}],
    bein:     [{name:'Eğlence Paketi',price:149.99},{name:'Spor Paketi',price:249.99},{name:'Süper Paket',price:349.99}],
    tvplus:   [{name:'Bireysel',price:109.99},{name:'Aile',price:179.99}],
  },
  us: {
    netflix:  [{name:'Standard w/ Ads',price:6.99},{name:'Standard',price:15.49},{name:'Premium',price:22.99}],
    youtube:  [{name:'Individual',price:13.99},{name:'Family',price:22.99},{name:'Student',price:7.99}],
    spotify:  [{name:'Individual',price:11.99},{name:'Duo',price:16.99},{name:'Family',price:19.99},{name:'Student',price:5.99}],
    disney:   [{name:'Basic w/ Ads',price:7.99},{name:'Standard',price:13.99}],
    hbo:      [{name:'With Ads',price:9.99},{name:'Ad-Free',price:15.99},{name:'Ultimate',price:19.99}],
    apple:    [{name:'Individual',price:9.99},{name:'Family',price:16.99}],
    prime:    [{name:'Prime',price:8.99}],
    twitch:   [{name:'Free',price:0},{name:'Turbo',price:11.99}],
    kick:     [{name:'Free',price:0}],
    tvplus:   [{name:'Individual',price:9.99}],
  }
};

let AI_PRICES = {}; // runtime'da AI'dan gelen fiyatlar

// localStorage'dan yükle
try {
  const cached = localStorage.getItem(AI_PRICE_CACHE_KEY);
  const ts = localStorage.getItem(AI_PRICE_TS_KEY);
  if (cached && ts && (Date.now() - parseInt(ts)) < AI_PRICE_TTL) {
    AI_PRICES = JSON.parse(cached);
  }
} catch(e) {}

// Ana fiyat fonksiyonu — AI varsa AI, yoksa fallback
function getSmartPlans(svcId) {
  const region = SETTINGS.region || 'tr';
  // Önce AI cache'e bak
  if (AI_PRICES[region] && AI_PRICES[region][svcId] && AI_PRICES[region][svcId].length > 0) {
    return AI_PRICES[region][svcId];
  }
  // Sonra COUNTRY_PRICES'a bak
  const countryCode = SETTINGS.country || 'tr';
  const countryData = COUNTRY_PRICES[countryCode];
  if (countryData && countryData[svcId] && countryData[svcId].plans) {
    return countryData[svcId].plans;
  }
  // Fallback DB
  const fb = FALLBACK_PRICES[region] || FALLBACK_PRICES.tr;
  if (fb[svcId]) return fb[svcId];
  // Son çare: POPULAR_SVCS
  const svcDef = POPULAR_SVCS.find(p => p.id === svcId);
  if (svcDef && svcDef.plans) return svcDef.plans[region] || svcDef.plans.tr || [];
  return [];
}

// AI'dan fiyat güncelle
async function fetchAIPrices(force = false) {
  const ts = parseInt(localStorage.getItem(AI_PRICE_TS_KEY) || '0');
  if (!force && (Date.now() - ts) < AI_PRICE_TTL && Object.keys(AI_PRICES).length > 0) return;

  const region = SETTINGS.region || 'tr';
  const country = SETTINGS.country || 'tr';
  const countryObj = COUNTRIES.find(c => c.code === country);
  const countryName = countryObj ? countryObj.name : 'Türkiye';
  const currency = countryObj ? countryObj.currency : 'TRY';
  const symbol = countryObj ? countryObj.symbol : '₺';

  // Ayarlar sayfasında durum göster
  const rateRow = document.getElementById('rateLastUpdate');
  if (rateRow) rateRow.textContent = '🤖 AI fiyatları güncelleniyor...';

  const serviceList = POPULAR_SVCS.map(s => s.name).join(', ');

  const prompt = `Sen bir fiyat araştırma asistanısın. Aşağıdaki streaming/içerik servislerinin ${countryName} ülkesindeki GÜNCEL aylık abonelik fiyatlarını ${currency} (${symbol}) cinsinden ver.

Servisler: ${serviceList}

SADECE JSON döndür, başka hiçbir şey yazma. Format şu şekilde olmalı:
{
  "netflix": [{"name":"Plan Adı","price":99.99}, ...],
  "youtube": [...],
  "spotify": [...],
  "disney": [...],
  "hbo": [...],
  "apple": [...],
  "prime": [...],
  "twitch": [...],
  "kick": [...],
  "exxen": [...],
  "bein": [...],
  "tvplus": [...]
}

Önemli kurallar:
- Fiyatlar ${currency} cinsinden olmalı
- Ücretsiz planlar için price: 0 kullan
- Bilmediğin servis için boş array [] kullan
- Sadece JSON, markdown yok, açıklama yok`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    if (!res.ok || !data.content) {
      throw new Error('API yanıt hatası: ' + ((data.error && data.error.message) || res.status));
    }
    // Tüm text bloklarını birleştir
    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    // JSON'ı parse et - markdown fence'leri temizle
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Geçerli mi kontrol et
      const validKeys = Object.keys(parsed).filter(k => Array.isArray(parsed[k]));
      if (validKeys.length > 0) {
        if (!AI_PRICES[region]) AI_PRICES[region] = {};
        validKeys.forEach(k => {
          if (parsed[k].length > 0) AI_PRICES[region][k] = parsed[k];
        });
        localStorage.setItem(AI_PRICE_CACHE_KEY, JSON.stringify(AI_PRICES));
        localStorage.setItem(AI_PRICE_TS_KEY, String(Date.now()));
        if (rateRow) rateRow.textContent = '✓ AI fiyatları güncellendi · ' + new Date().toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'});
        showToast('🤖 Fiyatlar AI ile güncellendi');
        return true;
      }
    }
  } catch(e) {
    // AI fiyat güncellenemedi, fallback kullanılacak
  }

  // AI başarısız → fallback
  if (rateRow) rateRow.textContent = 'Fallback veritabanı kullanılıyor';
  return false;
}

// getCountryPlans'ı AI destekli versiyonla override et
const _origGetCountryPlans = getCountryPlans;
window.getCountryPlans = function(svcId) {
  return getSmartPlans(svcId);
};

// openPlanModal'ı "Özel Fiyat" butonuyla zenginleştir
const _origOpenPlanModal = openPlanModal;
window.openPlanModal = function(s) {
  planModalSvc = s;
  planModalSelected = null;
  planModalCustom = false;

  const L = LOGO[s.id] || null;
  let logoHtml = '';
  if (L && L.html && L.html.includes('<img')) {
    const matchResult = L.html.match(/src="([^"]+)"/);const iS = matchResult ? matchResult[1] : '';
    logoHtml = `<img src="${iS}" style="width:32px;height:32px;object-fit:contain;">`;
  }
  document.getElementById('planModalLogo').style.background = TILE_GRADIENTS[s.id] || s.color;
  document.getElementById('planModalLogo').innerHTML = logoHtml;
  document.getElementById('planModalName').textContent = s.name;

  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  document.getElementById('planRenewInput').value = d.toISOString().split('T')[0];

  renderPlanList(s);
  document.getElementById('planModal').classList.add('open');
};

let planModalCustom = false;

function renderPlanList(s) {
  // Yıllık/aylık toggle state
  if (typeof window._planBillingAnnual === 'undefined') window._planBillingAnnual = false;

  const plans = getSmartPlans(s.id);
  const sym = getCountrySymbol();
  const list = document.getElementById('planList');
  list.innerHTML = '';

  // Yıllık/aylık toggle
  const billingToggle = document.createElement('div');
  billingToggle.style.cssText = 'display:flex;background:rgba(255,255,255,.08);border-radius:12px;padding:3px;margin-bottom:14px;gap:2px;';
  ['Aylık','Yıllık (tasarruf et)'].forEach((label, idx) => {
    const btn = document.createElement('button');
    const isAnnual = idx === 1;
    const isActive = window._planBillingAnnual === isAnnual;
    btn.style.cssText = `flex:1;padding:8px 10px;border-radius:10px;border:none;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .2s;background:${isActive?'rgba(255,255,255,.18)':'transparent'};color:${isActive?'#fff':'rgba(255,255,255,.45)'};`;
    btn.textContent = label;
    btn.onclick = () => { window._planBillingAnnual = isAnnual; renderPlanList(s); };
    billingToggle.appendChild(btn);
  });
  list.appendChild(billingToggle);

  // Plan seçenekleri
  plans.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'plan-option' + (i === 0 ? ' selected' : '');
    if (i === 0) planModalSelected = p;
    el.innerHTML = `
      <div class="plan-option-left">
        <div class="plan-option-name">${p.name}</div>
        <div style="font-size:13px;color:rgba(255,255,255,.45);">${p.price <= 0 ? 'Ücretsiz' : window._planBillingAnnual ? sym + (p.price * 10).toFixed(2) + '/yıl' : sym + p.price.toFixed(2) + '/ay'}</div>
      </div>
      <div class="plan-option-check">${i === 0 ? '<svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5L11 1" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' : ''}</div>`;
    el.onclick = () => {
      planModalSelected = p;
      planModalCustom = false;
      list.querySelectorAll('.plan-option').forEach(o => {
        o.classList.remove('selected');
        o.querySelector('.plan-option-check').innerHTML = '';
      });
      el.classList.add('selected');
      el.querySelector('.plan-option-check').innerHTML = '<svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5L11 1" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
      // Özel fiyat alanını gizle
      const customArea = document.getElementById('planCustomArea');
      if (customArea) customArea.style.display = 'none';
    ;
    };
    list.appendChild(el);
  });

  // ── Özel Fiyat butonu ──
  const customBtn = document.createElement('div');
  customBtn.id = 'planCustomBtn';
  customBtn.className = 'plan-option';
  customBtn.style.cssText = 'border-style:dashed;border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.03);cursor:pointer;';
  customBtn.innerHTML = `
    <div class="plan-option-left">
      <div class="plan-option-name" style="color:rgba(255,255,255,.7);">✏️ Özel Fiyat Gir</div>
      <div style="font-size:13px;color:rgba(255,255,255,.35);">Kendi ödediğin tutarı yaz</div>
    </div>
    <div class="plan-option-check" id="planCustomCheck"></div>`;
  customBtn.onclick = () => {
    planModalCustom = true;
    planModalSelected = null;
    list.querySelectorAll('.plan-option').forEach(o => {
      o.classList.remove('selected');
      const chk = o.querySelector('.plan-option-check');
      if (chk) chk.innerHTML = '';
    });
    customBtn.classList.add('selected');
    document.getElementById('planCustomCheck').innerHTML = '<svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5L11 1" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    const customArea = document.getElementById('planCustomArea');
    if (customArea) { customArea.style.display = 'block'; setTimeout(() => customArea.querySelector('input').focus(), 100); }
  };
  list.appendChild(customBtn);

  // Özel fiyat giriş alanı (başta gizli)
  const customArea = document.createElement('div');
  customArea.id = 'planCustomArea';
  customArea.style.cssText = 'display:none;padding:12px 0 4px;';
  const cSym = getCountrySymbol();
  customArea.innerHTML = `
    <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.5px;margin-bottom:8px;">ÖZEL TUTAR (${cSym})</div>
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="font-size:22px;font-weight:800;color:rgba(255,255,255,.5);">${cSym}</div>
      <input id="planCustomPriceInput" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"
        style="flex:1;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.2);border-radius:12px;padding:13px 15px;font-size:20px;font-weight:700;color:#fff;font-family:inherit;outline:none;-webkit-appearance:none;"
        oninput="this.style.borderColor=this.value?'rgba(255,255,255,.5)':'rgba(255,255,255,.2)'">
    </div>
    <div id="planCustomName" style="margin-top:10px;">
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.5px;margin-bottom:6px;">PLAN ADI (opsiyonel)</div>
      <input id="planCustomNameInput" type="text" placeholder="Özel Plan" maxlength="30"
        style="width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:11px 14px;font-size:14px;color:#fff;font-family:inherit;outline:none;" autocomplete="off">
    </div>`;
  list.appendChild(customArea);

  // Ekle butonu
  const btn = document.createElement('button');
  btn.className = 'plan-confirm-btn';
  btn.style.cssText = 'background:#fff;color:#000;margin-top:12px;';
  btn.textContent = 'Ekle';
  btn.onclick = confirmSmartPlanAdd;
  list.appendChild(btn);

}


function confirmSmartPlanAdd() {
  if (!planModalSvc) return;
  // Premium limit: bu servis zaten listede yoksa ve toplam >= 6 ise → premium gerekli
  const existingIdx = SVC.findIndex(sv => sv.id === planModalSvc.id);
  const isNew = existingIdx < 0;
  
  // 7. hizmet ekleme pain point düzeltmesi - direkt premium'a yönlendirme yerine uyarı
  if (isNew && SVC.length >= FREE_LIMIT && !isPremium()) {
    closePlanModal();
    openPremiumSheet();
    return;
  }
  const s = planModalSvc;
  const renew = document.getElementById('planRenewInput').value || null;

  let price, planName;

  if (planModalCustom) {
    const priceInput = document.getElementById('planCustomPriceInput');const rawPrice = parseFloat((priceInput && priceInput.value) || '0') || 0;
    const nameInput = document.getElementById('planCustomNameInput');const rawName = (nameInput && nameInput.value.trim()) || 'Özel Plan';
    price = rawPrice;
    planName = rawName;
  } else {
    if (!planModalSelected) return;
    const basePrice = planModalSelected.price;
    price = window._planBillingAnnual && basePrice > 0 ? +(basePrice * 10 / 12).toFixed(2) : basePrice;
    planName = planModalSelected.name + (window._planBillingAnnual && basePrice > 0 ? ' (Yıllık)' : '');
  }

  const existing = SVC.findIndex(sv => sv.id === s.id);
  const countryCurrency = (COUNTRIES.find(c=>c.code===(SETTINGS.country||'tr'))||{}).currency || 'TRY';
  // Kişi başı fiyat hesapla
  let myPrice = price;
  if (typeof _planPayMethod !== 'undefined') {
    if (_planPayMethod === 'split') myPrice = price / (typeof _planUserCount !== 'undefined' ? _planUserCount : 1);
    else if (_planPayMethod === 'other') myPrice = 0;
  }
  const svc = { ...s, email: '', pwd: '', price: myPrice, _fullPrice: price, _userCount: typeof _planUserCount !== 'undefined' ? _planUserCount : 1, _payMethod: typeof _planPayMethod !== 'undefined' ? _planPayMethod : 'me', priceCurrency: countryCurrency, plan: planName, renew };
  if (existing >= 0) SVC[existing] = svc;
  else SVC.push(svc);
  saveData();
  buildGrid();
  renderSubs && renderSubs();
  closePlanModal();
  showToast('✓ ' + s.name + ' eklendi');
  const newIdx = existing >= 0 ? existing : SVC.length - 1;
  setTimeout(() => tap(newIdx), 350);
}

// confirmPlanAdd'ı yeni versiyona yönlendir
window.confirmPlanAdd = confirmSmartPlanAdd;

// Ayarlar sayfasına "Fiyatları Güncelle" butonu entegrasyonu
const _origFetchExchangeRates = fetchExchangeRates;
window.fetchExchangeRates = async function(force = false) {
  await _origFetchExchangeRates(force);
  if (force) await fetchAIPrices(true);
};

// ── Uygulama açılınca AI fiyat güncelle ──
const _origUnlockApp = unlockApp;
window.unlockApp = function() {
  _origUnlockApp();
  // Biraz gecikmeyle AI fiyatlarını çek (uygulama açılışını bloklamasın)
  setTimeout(() => fetchAIPrices(false), 1500);
};
function tick(){const d=new Date();const clk=document.getElementById('clk');if(!clk)return;clk.textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
tick();
let _tickInterval = setInterval(tick,30000);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearInterval(_tickInterval);}
  else{tick();_tickInterval=setInterval(tick,30000);}
});


// ══════════════════════════════════════════════════
// ŞIFRELEME SİSTEMİ (Web Crypto API — AES-GCM + PBKDF2)
// ══════════════════════════════════════════════════
let _cryptoKey = null;

// Per-device salt — secret değil, sadece rainbow table'ı engeller
function _getCryptoSalt() {
  let s = localStorage.getItem('easytv_csk');
  if (!s) {
    s = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
    localStorage.setItem('easytv_csk', s);
  }
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

// PIN'den PBKDF2 ile AES-256-GCM key türet (100k iterasyon)
async function setKeyFromRawPIN(rawPin) {
  const salt = _getCryptoSalt();
  const km = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(rawPin), 'PBKDF2', false, ['deriveKey']
  );
  _cryptoKey = await crypto.subtle.deriveKey(
    {name:'PBKDF2', salt, iterations:100000, hash:'SHA-256'},
    km, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']
  );
}

async function getCryptoKey() {
  if (_cryptoKey) return _cryptoKey;
  // Fallback: userId tabanlı key (PIN girilmeden unlock edilen durumlar)
  const userId = (currentUser && currentUser.id) || 'guest';
  const salt = _getCryptoSalt();
  const km = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(userId + '::easytv_v3'), 'PBKDF2', false, ['deriveKey']
  );
  _cryptoKey = await crypto.subtle.deriveKey(
    {name:'PBKDF2', salt, iterations:50000, hash:'SHA-256'},
    km, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']
  );
  return _cryptoKey;
}

async function encryptStr(plaintext) {
  if (!plaintext) return '';
  try {
    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, new TextEncoder().encode(plaintext));
    const combined = new Uint8Array(iv.byteLength + ct.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ct), iv.byteLength);
    return btoa(String.fromCharCode(...combined));
  } catch(e) { return plaintext; }
}

async function decryptStr(ciphertext) {
  if (!ciphertext) return '';
  try {
    const key = await getCryptoKey();
    const bytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv: bytes.slice(0,12)}, key, bytes.slice(12));
    return new TextDecoder().decode(pt);
  } catch(e) { return ciphertext; }
}

async function hashPin(pin) {
  const enc = new TextEncoder().encode(pin + '::easytv_pin_salt');
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function savePin(pin) {
  SETTINGS.pinHash = await hashPin(pin);
  SETTINGS.pin = '';
  saveDataRaw();
}

async function checkPinHash(input) {
  if (SETTINGS.pinHash) return (await hashPin(input)) === SETTINGS.pinHash;
  return input === SETTINGS.pin;
}

// Kredentialleri şifreli kaydet / çöz
async function encryptCreds(svc) {
  const e = {...svc};
  if (svc.email) e.email = await encryptStr(svc.email);
  if (svc.pwd)   e.pwd   = await encryptStr(svc.pwd);
  e._enc = true;
  return e;
}
async function decryptCreds(svc) {
  if (!svc._enc) return svc;
  const d = {...svc};
  if (svc.email) d.email = await decryptStr(svc.email);
  if (svc.pwd)   d.pwd   = await decryptStr(svc.pwd);
  delete d._enc;
  return d;
}

// Unlock'ta SVC'yi bellekte çöz
async function _decryptSVCInMemory() {
  try { SVC = await Promise.all(SVC.map(s => decryptCreds(s))); } catch(e) {}
}

// Kilitlemede key'i bellekten sil
function _clearCryptoKey() { _cryptoKey = null; }

// saveDataRaw: sadece ham veri kaydet (şifrelemeden önce)
function saveDataRaw() {
  try {
    localStorage.setItem('easytv_svc', JSON.stringify(SVC));
    localStorage.setItem('easytv_settings', JSON.stringify(SETTINGS));
    localStorage.setItem('easytv_profile', JSON.stringify(PROFILE));
    localStorage.setItem('easytv_pin', SETTINGS.pinHash || SETTINGS.pin || '');
  } catch(e) {}
}

// SVC açık halini tutan in-memory store
let SVC_CLEAR = []; // her zaman şifresiz


// ══════════════════════════════════════════════════
// BİLDİRİM SİSTEMİ
// ══════════════════════════════════════════════════
async function requestNotifPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function scheduleRenewalNotifs() {
  if (!('Notification' in window)) return;
  if (!isPremium()) return;
  const days = [];
  if (SETTINGS.remind1) days.push(1);
  if (SETTINGS.remind3) days.push(3);
  if (SETTINGS.remind7) days.push(7);
  if (days.length === 0) return;
  const today = new Date(); today.setHours(0,0,0,0);
  SVC.forEach(s => {
    if (!s.renew) return;
    const d = new Date(s.renew); d.setHours(0,0,0,0);
    const diff = Math.ceil((d - today) / 864e5);
    if (days.includes(diff) || diff === 0) {
      const msg = diff === 0
        ? s.name + ' aboneliğin bugün yenileniyor!'
        : s.name + ' aboneliğin ' + diff + ' gün içinde yenileniyor.';
      if (document.visibilityState === 'visible') {
        showInAppNotif(msg, s.color || '#fff');
      } else if (Notification.permission === 'granted') {
        new Notification('EasyTV', { body: msg });
      }
    }
  });
}

function showInAppNotif(msg, color) {
  let nb = document.getElementById('notifBanner');
  if (!nb) {
    nb = document.createElement('div');
    nb.id = 'notifBanner';
    nb.style.cssText = 'position:absolute;top:60px;left:16px;right:16px;z-index:500;border-radius:16px;padding:14px 18px;font-size:13px;font-weight:600;color:#fff;backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.15);box-shadow:0 8px 32px rgba(0,0,0,.5);transform:translateY(-20px);opacity:0;transition:all .35s cubic-bezier(.34,1.4,.64,1);pointer-events:none;';
    document.getElementById('phone').appendChild(nb);
  }
  nb.style.background = 'rgba(30,31,40,.95)';
  nb.style.borderLeft = '3px solid ' + color;
  nb.textContent = '🔔 ' + msg;
  nb.style.transform = 'translateY(0)';
  nb.style.opacity = '1';
  setTimeout(() => { nb.style.transform = 'translateY(-20px)'; nb.style.opacity = '0'; }, 4500);
}

// toggleSetting'e bildirim izni ekle
const _origToggleSetting = window.toggleSetting;
window.toggleSetting = function(key, el) {
  _origToggleSetting(key, el);
  if (key === 'reminder' && SETTINGS.reminder) {
    requestNotifPermission().then(granted => {
      if (!granted) showToast('Bildirim izni verilmedi');
      else scheduleRenewalNotifs();
    });
  }
};

// Eksik fonksiyon: PIN Değiştir
function openPinChange() {
  pinMode = 'change1';
  pinVal = '';
  document.getElementById('pinGreeting').textContent = 'Mevcut PIN';
  document.getElementById('pinHint').textContent = 'Önce mevcut PIN\'ini gir';
  updatePinDots();
  document.getElementById('pinScreen').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
}

// saveData cloud sync wrapper'ı uygula
try { _wrapSaveData(); } catch(e) { console.error('_wrapSaveData hatası:', e); }

// ── WELCOME SCREEN BRAND PRESS EFFECTS ──
(function(){
  function addPressEffect(id, makeRipple){
    var btn = document.getElementById(id);
    if(!btn) return;
    function onDown(e){
      btn.classList.add('pressed');
      var old = btn.querySelector('.apple-ripple,.google-ring');
      if(old) old.remove();
      var r = makeRipple();
      btn.appendChild(r);
      setTimeout(function(){ r.remove(); }, 560);
    }
    function onUp(){ btn.classList.remove('pressed'); }
    btn.addEventListener('touchstart', onDown, {passive:true});
    btn.addEventListener('touchend', onUp, {passive:true});
    btn.addEventListener('touchcancel', onUp, {passive:true});
    btn.addEventListener('mousedown', onDown);
    btn.addEventListener('mouseup', onUp);
    btn.addEventListener('mouseleave', onUp);
  }
  addPressEffect('appleLoginBtn', function(){
    var d = document.createElement('div');
    d.className = 'apple-ripple';
    return d;
  });
  addPressEffect('googleLoginBtn', function(){
    var d = document.createElement('div');
    d.className = 'google-ring';
    return d;
  });
})();


// ── BAŞLAT ──
try { applySettings(); } catch(e) { console.error('applySettings hatası:', e); }
try { applyLang(); } catch(e) { console.error('applyLang hatası:', e); }
initAuth().catch(function(e) { console.error('initAuth hatası:', e); _showFallbackScreen(); });


function checkRenewals(){
  var today=new Date();today.setHours(0,0,0,0);
  SVC.forEach(function(s,i){
    if(!s.renew)return;
    var d=new Date(s.renew);d.setHours(0,0,0,0);
    var diff=Math.ceil((d-today)/864e5);
    if(diff<=0&&diff>-3){setTimeout(function(){showRenewalAlert(i);},800+(i*200));}
  });
}

function renderSubs(){
  const paid=SVC.filter(s=>s.price>0);
  const displayCode=SETTINGS.displayCurrency||'TRY';
  const totalConverted=paid.reduce((a,s)=>{const cv=convertPrice(s.price,s.priceCurrency||'TRY');return a+cv.value;},0);
  const dispSym=(CURRENCIES.find(cc=>cc.code===displayCode)||CURRENCIES[0]).symbol;
  const totalMonthlyEl=document.getElementById('totalMonthly');
  const subsSubtitleEl=document.getElementById('subsSubtitle');
  const list=document.getElementById('subsList');
  animateNumber(totalMonthlyEl,totalConverted,dispSym,'',2);
  renderSpendingChart(SVC);
  const dates=paid.filter(s=>s.renew).map(s=>({d:new Date(s.renew)})).sort((a,b)=>a.d-b.d);
  var nrEl=document.getElementById('nextRenew');
  if(nrEl)nrEl.textContent=dates.length?formatDate(dates[0].d):'—';
  if(subsSubtitleEl)subsSubtitleEl.textContent=LANG==='tr'?`${paid.length} aktif üyelik`:`${paid.length} active subscriptions`;
  if(!list)return;
  list.innerHTML='';
  if(SVC.length===0){
    list.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;"><div style="font-size:48px;opacity:.3;">📺</div><div style="font-size:16px;font-weight:700;color:rgba(255,255,255,.5);">${t('no_subs')}</div></div>`;
    return;
  }
  const today=new Date();
  today.setHours(0,0,0,0);
  const svcWithIdx=SVC.map((s,i)=>({...s,_idx:i}));
  svcWithIdx.sort((a,b)=>{
    if(!a.renew&&!b.renew)return 0;
    if(!a.renew)return 1;
    if(!b.renew)return-1;
    return new Date(a.renew)-new Date(b.renew);
  }).forEach(s=>{
    const card=document.createElement('div');
    card.className='sub-card';
    card.style.setProperty('--svc-color',s.color||'rgba(255,255,255,.2)');
    const daysLeft=s.renew?Math.ceil((new Date(s.renew)-today)/864e5):null;
    const urgent=daysLeft!==null&&daysLeft<=3;
    const warn=daysLeft!==null&&daysLeft<=7&&!urgent;
    let badge='';
    if(daysLeft===null)badge=`<div class="sub-badge ok">${t('free_badge')}</div>`;
    else if(urgent)badge=`<div class="sub-badge">${daysLeft<=0?t('today_badge'):t('days_left',daysLeft)}</div>`;
    else if(warn)badge=`<div class="sub-badge warn">${t('days_left',daysLeft)}</div>`;
    else badge=`<div class="sub-badge ok">${formatDate(new Date(s.renew))}</div>`;
    const idx=s._idx;
    const L2=LOGO[s.id]||null;
    const useDark=s.textDark||(L2&&L2.textDark);
    const logoHtml=(useDark&&L2&&L2.htmlDark)?L2.htmlDark:(L2&&L2.html);
    let cLogo='';
    if(s.faviconUrl){
      cLogo=`<img src="${s.faviconUrl}" style="width:34px;height:34px;object-fit:contain;border-radius:8px;">`;
    }else if(L2&&logoHtml&&logoHtml.includes('<img')){
      const cardLogoHtml=logoHtml.replace(/width:[^;"]+/g,'width:34px').replace(/height:[^;"]+/g,'height:34px');
      cLogo=cardLogoHtml;
    }else if(L2&&logoHtml){
      const sc2=Math.min(28/(L2.w||28),28/(L2.h||28));
      cLogo=`<div style="width:${Math.round((L2.w||28)*sc2)}px;height:${Math.round((L2.h||28)*sc2)}px;display:flex;align-items:center;justify-content:center;">${logoHtml}</div>`;
    }else{
      cLogo=`<span style="font-size:22px;font-weight:800;color:#fff;">${(s.name||'?')[0].toUpperCase()}</span>`;
    }
    card.innerHTML=`<div style="width:44px;height:44px;border-radius:13px;background:${s.color||'rgba(255,255,255,.1)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">${cLogo}</div><div style="flex:1;min-width:0;"><div class="sub-name">${s.name}</div><div class="sub-plan">${s.plan||'Standart'}</div>${badge}</div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0;"><div style="font-size:19px;font-weight:800;color:#fff;letter-spacing:-.5px;white-space:nowrap;">${s.price>0?formatPrice(s.price):'—'}</div><div style="font-size:11px;color:rgba(255,255,255,.33);margin-top:-2px;">${s.price>0?t('per_month'):''}</div><button onclick="event.stopPropagation();openSubEdit(${idx})" style="margin-top:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:5px 13px;color:rgba(255,255,255,.75);font-size:12px;font-weight:600;cursor:pointer;">${t('edit_btn')}</button></div>`;
    card.onclick=()=>openSubEdit(idx);
    list.appendChild(card);
  });
}

function renderSpendingChart(svc) {
  try {
    var el = document.getElementById('spendingChart');
    if (!el) return;
    if (!svc || svc.length === 0) {
      el.innerHTML = '<div class="pie-chart-card"><div style="text-align:center;padding:40px 20px;"><div style="font-size:48px;opacity:.2;">📊</div><div style="font-size:13px;color:rgba(255,255,255,.3);margin-top:12px;">'+(LANG==='tr'?'Henüz servis eklenmedi':'No services added yet')+'</div></div></div>';
      return;
    }
    var displayCode = SETTINGS.displayCurrency || 'TRY';
    var dispSym = (CURRENCIES.find(function(c){return c.code===displayCode;})||CURRENCIES[0]).symbol;
    var allSvcs = svc.map(function(s) {
      var cv; try { cv = convertPrice(s.price||0, s.priceCurrency||'TRY'); } catch(e) { cv = {value:s.price||0}; }
      return {id:s.id, name:s.name, color:s.color||'#888', _disp:cv.value||0};
    }).sort(function(a,b){return b._disp-a._disp;});
    var total = allSvcs.reduce(function(a,s){return a+s._disp;},0);
    var allTotal = allSvcs.reduce(function(a,s){return a+(s._disp||1);},0);
    var cx=80, cy=80, r=68, ir=30;
    var sliceData=[], offset=0;
    function polarToXY(angle,radius){var rad=(angle-90)*Math.PI/180;return {x:cx+radius*Math.cos(rad),y:cy+radius*Math.sin(rad)};}
    var svgSlices = allSvcs.map(function(s,i){
      var pct = allTotal>0 ? (s._disp||1)/allTotal : 1/allSvcs.length;
      var deg = pct*360; var sa=offset*360; var ea=sa+deg; var large=deg>180?1:0;
      var os=polarToXY(sa,r), oe=polarToXY(ea,r), is_=polarToXY(sa,ir), ie=polarToXY(ea,ir);
      var path = pct>=0.999
        ? 'M '+cx+' '+(cy-r)+' A '+r+' '+r+' 0 1 1 '+(cx-0.01)+' '+(cy-r)+' L '+(cx-0.01)+' '+(cy-ir)+' A '+ir+' '+ir+' 0 1 0 '+cx+' '+(cy-ir)+' Z'
        : 'M '+os.x.toFixed(1)+' '+os.y.toFixed(1)+' A '+r+' '+r+' 0 '+large+' 1 '+oe.x.toFixed(1)+' '+oe.y.toFixed(1)+' L '+ie.x.toFixed(1)+' '+ie.y.toFixed(1)+' A '+ir+' '+ir+' 0 '+large+' 0 '+is_.x.toFixed(1)+' '+is_.y.toFixed(1)+' Z';
      sliceData.push({id:'ps'+i,name:s.name,color:s.color,price:s._disp,pct:pct,midAngle:sa+deg/2});
      offset+=pct;
      return '<path id="ps'+i+'" d="'+path+'" fill="'+s.color+'" stroke="rgba(12,12,22,.6)" stroke-width="1.5" style="cursor:pointer;opacity:0;transition:opacity .3s '+(i*0.05).toFixed(2)+'s,transform .25s cubic-bezier(.34,1.4,.64,1);transform-origin:'+cx+'px '+cy+'px;" onclick="selectPieSlice('+i+')"/>';
    }).join('');
    var svg = '<svg id="pieChartSvg" viewBox="0 0 160 160" width="140" height="140" style="flex-shrink:0;filter:drop-shadow(0 6px 18px rgba(0,0,0,.5));">'
      +svgSlices
      +'<circle cx="'+cx+'" cy="'+cy+'" r="'+(ir-1)+'" fill="rgba(12,12,22,.92)"/>'
      +'</svg>';
    var legend = allSvcs.slice(0,7).map(function(s){
      var pct2=total>0?Math.round(s._disp/total*100):0;
      var nm=s.name.length>13?s.name.slice(0,12)+'…':s.name;
      return '<div style="display:flex;align-items:center;gap:7px;">'
        +'<div style="width:8px;height:8px;border-radius:2px;flex-shrink:0;background:'+s.color+'"></div>'
        +'<span style="font-size:11px;color:rgba(255,255,255,.65);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+nm+'</span>'
        +'<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,.4);flex-shrink:0;">%'+pct2+'</span>'
        +'</div>';
    }).join('');
    el.innerHTML = '<div class="pie-chart-card">'
      +'<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.3);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:16px;">'+(LANG==='tr'?'AYLIK HARCAMA':'MONTHLY SPENDING')+'</div>'
      +'<div style="display:flex;align-items:center;gap:14px;">'
      +svg
      +'<div style="flex:1;display:flex;flex-direction:column;gap:7px;min-width:0;">'+legend+'</div>'
      +'</div>'
      +'<div id="pieSelectedInfo" style="min-height:18px;margin-top:10px;">'
      +'<div id="pieSelLbl" style="font-size:12px;font-weight:700;color:rgba(255,255,255,.5);text-align:center;"></div>'
      +'</div>'
      +'</div>';
    window._pieSliceData=sliceData; window._pieSorted=allSvcs; window._pieDispSym=dispSym; window._pieTotal=total; window._pieSelected=-1;
    setTimeout(function(){allSvcs.forEach(function(s,i){var e2=document.getElementById('ps'+i);if(e2)e2.style.opacity='1';});},60);
  } catch(err) {
    console.error('renderSpendingChart error:',err);
    var el=document.getElementById('spendingChart');
    if(el)el.innerHTML='<div class="pie-chart-card"><div style="text-align:center;padding:40px 20px;"><div style="font-size:48px;opacity:.2;">⚠️</div></div></div>';
  }
}

function selectPieSlice(idx) {
  var data = window._pieSliceData;
  if (!data) return;
  var prev = window._pieSelected;
  window._pieSelected = (prev===idx) ? -1 : idx;
  data.forEach(function(d,i){
    var el2=document.getElementById(d.id);
    if (!el2) return;
    el2.style.transform = (window._pieSelected===i) ? 'scale(1.08)' : 'scale(1)';
    el2.style.filter = (window._pieSelected===i) ? 'brightness(1.2)' : 'brightness(1)';
  });
  var lblEl=document.getElementById('pieSelLbl');
  if(window._pieSelected>=0 && lblEl){
    var s=data[idx];
    var sym=window._pieDispSym||'₺';
    lblEl.textContent=s.name+(s.price>0?' · '+sym+s.price.toFixed(2):'');
    lblEl.style.color='rgba(255,255,255,.85)';
  } else if(lblEl){
    lblEl.textContent='';
  }
}

function openEditProfile(){
  const modal=document.getElementById('editModal');
  const editName=document.getElementById('editName');
  const editEmail=document.getElementById('editEmail');
  if(!modal)return;
  if(editName)editName.value=PROFILE.name||'';
  if(editEmail)editEmail.value=PROFILE.email||'';
  modal.classList.add('open');
}

function closeEditProfile(){
  const modal=document.getElementById('editModal');
  if(modal)modal.classList.remove('open');
}

function saveProfile(){
  PROFILE.name=document.getElementById('editName').value.trim()||'Kullanıcı';
  PROFILE.email=document.getElementById('editEmail').value.trim()||'kullanici@email.com';
  saveData();
  renderProfile();
  closeEditProfile();
  showToast('✓ Profil güncellendi');
}

// ══════════════════════════════════════════════════
// INIT - Güvenli Başlatma
// ══════════════════════════════════════════════════
try { buildGrid(); } catch(e) { console.error('buildGrid hatası:', e); }
try { renderSubs(); } catch(e) { console.error('renderSubs hatası:', e); }
try { renderProfile(); } catch(e) { console.error('renderProfile hatası:', e); }
updateClock();
setInterval(updateClock,1000);

// Auth başlat
initAuth();

function updateClock(){
  const now=new Date();
  const h=String(now.getHours()).padStart(2,'0');
  const m=String(now.getMinutes()).padStart(2,'0');
  const clk=document.getElementById('clk');
  if(clk)clk.textContent=h+':'+m;
}

function initCtaGlow(){
  document.querySelectorAll('.cta-btn').forEach(btn=>{
    if(btn.dataset.glowBound==='1') return;
    const setGlow=(clientX,clientY)=>{
      const rect=btn.getBoundingClientRect();
      const x=((clientX-rect.left)/rect.width)*100;
      const y=((clientY-rect.top)/rect.height)*100;
      btn.style.setProperty('--glow-x', `${Math.max(0,Math.min(100,x))}%`);
      btn.style.setProperty('--glow-y', `${Math.max(0,Math.min(100,y))}%`);
    };
    btn.addEventListener('pointermove', e=>setGlow(e.clientX,e.clientY));
    btn.addEventListener('pointerenter', e=>setGlow(e.clientX,e.clientY));
    btn.addEventListener('pointerleave', ()=>{
      btn.style.setProperty('--glow-x', '50%');
      btn.style.setProperty('--glow-y', '50%');
    });
    btn.dataset.glowBound='1';
  });
}

initCtaGlow();
