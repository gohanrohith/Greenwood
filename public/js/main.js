// ── Mobile nav ────────────────────────────────────────
const navToggle  = document.getElementById('navToggle');
const navMenu    = document.getElementById('navMenu');
const navOverlay = document.getElementById('navOverlay');

function closeNav() {
  navMenu?.classList.remove('open');
  navToggle?.classList.remove('open');
  navOverlay?.classList.remove('open');
  document.body.style.overflow = '';
}

function openNav() {
  navMenu?.classList.add('open');
  navToggle?.classList.add('open');
  navOverlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeNav() : openNav();
  });
}

// Close on overlay click
navOverlay?.addEventListener('click', closeNav);

// Close on Escape key
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

// Mobile dropdown toggles
document.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
  link.addEventListener('click', e => {
    if (window.innerWidth > 900) return;
    e.preventDefault();
    const parent = link.parentElement;
    // Close siblings
    document.querySelectorAll('.has-dropdown.open').forEach(el => {
      if (el !== parent) el.classList.remove('open');
    });
    parent.classList.toggle('open');
  });
});

// Close nav when a leaf link is clicked (mobile)
document.querySelectorAll('#navMenu a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth > 900) return;
    if (link.closest('.has-dropdown') && link === link.closest('.has-dropdown').children[0]) return;
    closeNav();
  });
});

// ── Hero slider ───────────────────────────────────────
const slides = document.querySelectorAll('.hero-slide');
const dots   = document.querySelectorAll('.dot');
if (slides.length > 1) {
  let current = 0;
  const goTo = n => {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  setInterval(() => goTo(current + 1), 5000);
}

// ── Academics tabs ────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.tab);
    if (target) target.classList.add('active');
  });
});

// ── Sticky nav ────────────────────────────────────────
const navbar = document.getElementById('mainNav');
if (navbar) {
  function updateNav() { navbar.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

// ── Scroll-reveal + staggered grid children ───────────
(function() {
  document.querySelectorAll('.campus-cards, .why-grid, .achievements-grid, .achievements-full-grid, .testimonials-grid, .about-features, .about-grid, .campus-faculty-grid, .facilities-grid, .steps-grid, .campus-contacts, .downloads-grid').forEach(function(grid) {
    Array.from(grid.children).forEach(function(child, i) {
      if (!child.hasAttribute('data-reveal')) {
        child.setAttribute('data-reveal', '');
        child.style.setProperty('--delay', (i * 80) + 'ms');
      }
    });
  });
  document.querySelectorAll('.section-header').forEach(function(el) {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
  });
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function(el) { obs.observe(el); });
})();

// ── CountUp for numeric stats ─────────────────────────
(function() {
  const stats = document.querySelectorAll('.stat-number[data-count]');
  if (!stats.length) return;
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      let start = null;
      function tick(now) {
        if (!start) start = now;
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(p * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  stats.forEach(function(el) { obs.observe(el); });
})();
