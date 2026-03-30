/* ============================================================
   BAIG ESTATES — Main JavaScript
   Features: Nav scroll, scroll animations, counter, slider,
             project tabs, form handling, back-to-top
============================================================ */

'use strict';

// ============================================================
// NAVBAR SCROLL BEHAVIOR
// ============================================================
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

function handleNavScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active nav link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  let currentSection = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', handleNavScroll, { passive: true });

// ============================================================
// HAMBURGER MENU
// ============================================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

// Close menu on link click
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ============================================================
// SCROLL REVEAL ANIMATION
// ============================================================
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Unobserve after animating to save resources
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ============================================================
// ANIMATED COUNTER
// ============================================================
const statNums = document.querySelectorAll('.stat-num');
let countersStarted = false;

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current);
  }, 16);
}

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      statNums.forEach(el => animateCounter(el));
    }
  });
}, { threshold: 0.3 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

// ============================================================
// PROJECT TABS
// ============================================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;

    // Update buttons
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update content panels
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `tab-${targetTab}`) {
        content.classList.add('active');
        // Re-trigger reveal animations for newly shown cards
        content.querySelectorAll('.reveal-up').forEach(el => {
          el.classList.remove('visible');
          setTimeout(() => {
            revealObserver.observe(el);
          }, 50);
        });
      }
    });
  });
});

// ============================================================
// TESTIMONIALS SLIDER
// ============================================================
const track = document.getElementById('testimonialTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('sliderDots');

let currentSlide = 0;
let slidesPerView = getSlidesPerView();
let totalSlides;
let dots = [];
let autoSlideTimer;

function getSlidesPerView() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function initSlider() {
  const cards = track.querySelectorAll('.testimonial-card');
  slidesPerView = getSlidesPerView();
  totalSlides = Math.max(0, cards.length - slidesPerView);

  // Set card widths
  cards.forEach(card => {
    card.style.minWidth = `calc(${100 / slidesPerView}% - ${(slidesPerView - 1) * 24 / slidesPerView}px)`;
  });

  // Build dots
  dotsContainer.innerHTML = '';
  dots = [];
  for (let i = 0; i <= totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'slider-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  goToSlide(0);
}

function goToSlide(index) {
  currentSlide = Math.max(0, Math.min(index, totalSlides));
  const cardWidth = track.querySelector('.testimonial-card')?.offsetWidth || 0;
  const gap = 24;
  track.style.transform = `translateX(-${currentSlide * (cardWidth + gap)}px)`;

  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });

  // Update buttons
  prevBtn.style.opacity = currentSlide === 0 ? '0.4' : '1';
  nextBtn.style.opacity = currentSlide === totalSlides ? '0.4' : '1';
}

prevBtn.addEventListener('click', () => {
  goToSlide(currentSlide - 1);
  resetAutoSlide();
});

nextBtn.addEventListener('click', () => {
  goToSlide(currentSlide + 1);
  resetAutoSlide();
});

function startAutoSlide() {
  autoSlideTimer = setInterval(() => {
    if (currentSlide >= totalSlides) {
      goToSlide(0);
    } else {
      goToSlide(currentSlide + 1);
    }
  }, 4500);
}

function resetAutoSlide() {
  clearInterval(autoSlideTimer);
  startAutoSlide();
}

// Handle resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    initSlider();
  }, 250);
});

// Initialize
initSlider();
startAutoSlide();

// Touch/Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

track.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

track.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) goToSlide(currentSlide + 1);
    else goToSlide(currentSlide - 1);
    resetAutoSlide();
  }
}, { passive: true });

// ============================================================
// CONTACT FORM HANDLING
// ============================================================
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitText = document.getElementById('submitText');
const submitLoader = document.getElementById('submitLoader');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name) { showFieldError('name', 'Please enter your name'); return; }
  if (!phone || phone.length < 10) { showFieldError('phone', 'Please enter a valid phone number'); return; }

  // Show loader
  submitText.style.display = 'none';
  submitLoader.style.display = 'inline-flex';

  // Simulate form submission (UI demo)
  await new Promise(resolve => setTimeout(resolve, 1800));

  // Show success
  contactForm.style.display = 'none';
  formSuccess.style.display = 'block';
  formSuccess.style.animation = 'fadeInUp 0.5s ease forwards';
});

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.style.borderColor = '#e05757';
  field.focus();

  // Remove error after user starts typing
  field.addEventListener('input', function onInput() {
    field.style.borderColor = '';
    field.removeEventListener('input', onInput);
  });
}

// ============================================================
// BACK TO TOP
// ============================================================
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}, { passive: true });

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetPosition = target.offsetTop - navHeight - 20;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});

// ============================================================
// GALLERY LIGHTBOX (Simple)
// ============================================================
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const label = item.querySelector('.gallery-overlay span')?.textContent || 'Gallery Image';

    // Create lightbox
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.92);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; animation: fadeIn 0.3s ease;
    `;

    overlay.innerHTML = `
      <div style="text-align: center; padding: 24px; max-width: 800px; width: 100%;">
        <div style="
          width: 100%; aspect-ratio: 16/9; background: var(--color-dark-3);
          border: 1px solid rgba(201,168,76,0.2); border-radius: 12px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 16px; color: rgba(255,255,255,0.4); font-size: 1rem;
          background: ${getComputedStyle(item).background};
        ">
          <i class="fas fa-image" style="font-size: 3rem; color: rgba(201,168,76,0.3);"></i>
          <p style="font-family: 'Jost', sans-serif;">${label}</p>
          <p style="font-size: 0.78rem; opacity: 0.5;">Image placeholder — add your project photos here</p>
        </div>
        <p style="
          margin-top: 16px; font-family: 'Jost', sans-serif;
          font-size: 0.9rem; color: rgba(255,255,255,0.5);
        ">Click anywhere to close</p>
      </div>
    `;

    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  });
});

// ============================================================
// NUMBER FORMAT UTILITY
// ============================================================
function formatIndianNumber(num) {
  return num.toLocaleString('en-IN');
}

// ============================================================
// PAGE LOAD ANIMATION
// ============================================================
window.addEventListener('load', () => {
  document.body.classList.add('loaded');

  // Animate hero elements
  const heroElements = document.querySelectorAll('.hero .reveal-up');
  heroElements.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 200 + i * 150);
  });
});

// ============================================================
// LAZY LOAD PLACEHOLDER GRADIENTS (Performance)
// ============================================================
const placeholders = document.querySelectorAll('[class*="img-placeholder"]');

const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('loaded');
      lazyObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '200px' });

placeholders.forEach(el => lazyObserver.observe(el));

// ============================================================
// KEYBOARD ACCESSIBILITY
// ============================================================
document.addEventListener('keydown', (e) => {
  // Close mobile menu on Escape
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Slider keyboard control
  if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
  if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
});

console.log(
  '%cBaig Estates 🏡 — Building Dreams with Trust',
  'color: #c9a84c; font-size: 14px; font-weight: bold; font-family: serif;'
);
