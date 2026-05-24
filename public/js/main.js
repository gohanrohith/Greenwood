// ── Mobile nav ────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

// Mobile dropdown toggles
document.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
  link.addEventListener('click', e => {
    if (window.innerWidth > 900) return;
    e.preventDefault();
    const parent = link.parentElement;
    parent.classList.toggle('open');
  });
});

// Close nav when a non-toggle link is clicked (mobile)
document.querySelectorAll('.nav-link:not(.has-dropdown > .nav-link)').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth > 900) return;
    navMenu?.classList.remove('open');
    navToggle?.classList.remove('open');
    document.body.style.overflow = '';
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
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}
