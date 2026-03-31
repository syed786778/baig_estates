/* ============================================================
   PROPRUSH DEVELOPERS — script.js
   Fixed: counter anti-flicker, testimonials proper sizing,
          video lightbox, form, scroll animations
============================================================ */
'use strict';

// ============================================================
// NAVBAR SCROLL
// ============================================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  // Active nav highlighting
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}, { passive: true });

// ============================================================
// HAMBURGER
// ============================================================
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ============================================================
// SCROLL REVEAL
// ============================================================
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealEls.forEach(el => revealObs.observe(el));

// ============================================================
// COUNTER ANIMATION — no blinking, no cursor artifacts
// ============================================================
let countersRun = false;

function runCounters() {
  if (countersRun) return;
  countersRun = true;
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const fps = 60;
    const steps = Math.round(duration / (1000 / fps));
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (step >= steps) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, 1000 / fps);
  });
}

const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
  const statsObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      runCounters();
      statsObs.disconnect();
    }
  }, { threshold: 0.4 });
  statsObs.observe(statsSection);
}

// ============================================================
// PROJECT TABS
// ============================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.toggle('active', c.id === `tab-${tab}`);
    });
    // Re-observe newly shown reveal elements
    document.querySelectorAll(`#tab-${tab} .reveal-up`).forEach(el => {
      el.classList.remove('visible');
      setTimeout(() => revealObs.observe(el), 40);
    });
  });
});

// ============================================================
// TESTIMONIALS SLIDER — fixed card widths, no overflow
// ============================================================
const track    = document.getElementById('testiTrack');
const dotsWrap = document.getElementById('testiDots');
const prevBtn  = document.getElementById('testiPrev');
const nextBtn  = document.getElementById('testiNext');

let cur = 0;
let perView = 3;
let dots = [];
let total;
let autoTimer;

function getPerView() {
  if (window.innerWidth <= 768)  return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function buildSlider() {
  const cards = track.querySelectorAll('.testi-card');
  perView = getPerView();
  total = Math.max(0, cards.length - perView);

  // Set card flex-basis from JS to match current perView
  const gap = 20;
  cards.forEach(c => {
    c.style.flex = `0 0 calc(${100 / perView}% - ${gap * (perView - 1) / perView}px)`;
  });

  // Rebuild dots
  dotsWrap.innerHTML = '';
  dots = [];
  for (let i = 0; i <= total; i++) {
    const d = document.createElement('div');
    d.className = `t-dot${i === 0 ? ' active' : ''}`;
    d.addEventListener('click', () => { slideTo(i); resetAuto(); });
    dotsWrap.appendChild(d);
    dots.push(d);
  }

  slideTo(Math.min(cur, total));
}

function slideTo(i) {
  cur = Math.max(0, Math.min(i, total));
  const card = track.querySelector('.testi-card');
  if (!card) return;
  const cardW = card.offsetWidth;
  const gap   = 20;
  track.style.transform = `translateX(-${cur * (cardW + gap)}px)`;
  dots.forEach((d, idx) => d.classList.toggle('active', idx === cur));
  prevBtn.style.opacity = cur === 0      ? '0.35' : '1';
  nextBtn.style.opacity = cur >= total   ? '0.35' : '1';
}

prevBtn.addEventListener('click', () => { slideTo(cur - 1); resetAuto(); });
nextBtn.addEventListener('click', () => { slideTo(cur + 1); resetAuto(); });

function startAuto() {
  autoTimer = setInterval(() => slideTo(cur >= total ? 0 : cur + 1), 4500);
}
function resetAuto() { clearInterval(autoTimer); startAuto(); }

// Touch swipe
let tx = 0;
track.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; }, { passive: true });
track.addEventListener('touchend',   e => {
  const diff = tx - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 48) { slideTo(diff > 0 ? cur + 1 : cur - 1); resetAuto(); }
}, { passive: true });

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { slideTo(cur - 1); resetAuto(); }
  if (e.key === 'ArrowRight') { slideTo(cur + 1); resetAuto(); }
});

// Resize
let resizeT;
window.addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(buildSlider, 200);
}, { passive: true });

buildSlider();
startAuto();

// ============================================================
// VIDEO LIGHTBOX
// ============================================================
const lightbox  = document.getElementById('videoLightbox');
const vlOverlay = document.getElementById('vlOverlay');
const vlClose   = document.getElementById('vlClose');
const vlVideo   = document.getElementById('vlVideo');
const galleryVT = document.getElementById('galleryVideoTile');

function openLightbox() {
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  vlVideo.play().catch(() => {});
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  vlVideo.pause();
  vlVideo.currentTime = 0;
}

if (galleryVT) galleryVT.addEventListener('click', openLightbox);
if (vlOverlay) vlOverlay.addEventListener('click', closeLightbox);
if (vlClose)   vlClose.addEventListener('click', closeLightbox);

// Also play gallery thumbnail video on hover
const thumbVid = document.querySelector('.g-thumb-vid');
if (thumbVid && galleryVT) {
  galleryVT.addEventListener('mouseenter', () => thumbVid.play().catch(() => {}));
  galleryVT.addEventListener('mouseleave', () => thumbVid.pause());
}

// ============================================================
// GALLERY LIGHTBOX (for non-video tiles)
// ============================================================
document.querySelectorAll('.g-item:not(.g-video-tile)').forEach(item => {
  item.addEventListener('click', () => {
    const caption = item.dataset.caption || 'Gallery Image';
    const realImg = item.querySelector('.g-real-img');

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.92);
      display:flex;align-items:center;justify-content:center;cursor:pointer;
      animation:fadeInFast .25s ease;
    `;

    if (realImg) {
      overlay.innerHTML = `
        <div style="max-width:90vw;max-height:90vh;text-align:center">
          <img src="${realImg.src}" alt="${caption}" style="max-width:100%;max-height:82vh;border-radius:10px;object-fit:contain;" />
          <p style="margin-top:12px;color:rgba(255,255,255,.6);font-family:'DM Sans',sans-serif;font-size:.88rem;">${caption}</p>
        </div>`;
    } else {
      overlay.innerHTML = `
        <div style="text-align:center;padding:32px;color:rgba(255,255,255,.4);font-family:'DM Sans',sans-serif">
          <i class="fas fa-image" style="font-size:3rem;color:rgba(201,168,76,.35);display:block;margin-bottom:14px;"></i>
          <p>${caption}</p>
          <p style="font-size:.75rem;margin-top:8px;opacity:.5">Add your real project photo here</p>
        </div>`;
    }

    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  });
});

// ============================================================
// CONTACT FORM
// ============================================================
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const name  = document.getElementById('fname').value.trim();
  const phone = document.getElementById('fphone').value.trim();

  if (!name)                { flashError('fname',  'Please enter your full name'); return; }
  if (phone.length < 10)    { flashError('fphone', 'Please enter a valid phone number'); return; }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  // Simulate async send (replace with Formspree/EmailJS action)
  await delay(1800);

  form.style.display = 'none';
  formSuccess.style.display = 'block';
});

function flashError(id, msg) {
  const el = document.getElementById(id);
  el.style.borderColor = '#e05252';
  el.focus();
  el.addEventListener('input', function clear() {
    el.style.borderColor = '';
    el.removeEventListener('input', clear);
  });
  // Brief shake animation
  el.style.animation = 'shake .3s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// BACK TO TOP
// ============================================================
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => backTop.classList.toggle('visible', window.scrollY > 400), { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ============================================================
// SMOOTH ANCHOR SCROLL
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - navbar.offsetHeight - 16, behavior: 'smooth' });
    }
  });
});

// ============================================================
// PAGE LOAD — trigger hero reveals
// ============================================================
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 200 + i * 140);
  });
});

// Add shake keyframe dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
  @keyframes fadeInFast { from{opacity:0} to{opacity:1} }
`;
document.head.appendChild(shakeStyle);

console.log('%cProprush Developers 🏡 — Building Dreams with Trust', 'color:#c9a84c;font-size:13px;font-weight:bold;font-family:serif;');
