// main.js - shared behavior: mobile menu, counters, fade-in, form helpers.
// Load AFTER components.js (the navbar must exist first).

// ----- Mobile menu: open/close, and tap to open a dropdown -----
const burger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('.has-dropdown > a').forEach(a => {
    a.addEventListener('click', e => {
      if (window.innerWidth <= 768) {          // on phones, tapping opens the submenu
        e.preventDefault();
        a.parentElement.classList.toggle('open');
      } else {
        e.preventDefault();
      }
    });
  });
}

// ----- Fade in elements with class "reveal" when scrolled into view -----
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const seen = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => seen.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

// ----- Animated counters: <span data-count="2000"></span> counts up when visible -----
function runCounter(el) {
  const target = Number(el.dataset.count);
  const steps = 60;
  let n = 0;
  const timer = setInterval(() => {
    n++;
    el.textContent = Math.round(target * n / steps).toLocaleString('en-IN');
    if (n >= steps) clearInterval(timer);
  }, 25);
}
const counters = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && counters.length) {
  const seenC = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => { if (en.isIntersecting) { runCounter(en.target); obs.unobserve(en.target); } });
  }, { threshold: 0.5 });
  counters.forEach(c => seenC.observe(c));
}

// ----- Form helpers (used by apply, contact, login pages) -----
// Each field should sit inside <div class="form-group"> with a <span class="error-msg"></span>.
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isPhone(v) { return /^\d{10}$/.test(v); }

function showError(input, msg) {
  const group = input.closest('.form-group');
  group.classList.add('has-error');
  let span = group.querySelector('.error-msg');
  if (!span) { span = document.createElement('span'); span.className = 'error-msg'; group.appendChild(span); }
  span.textContent = msg;
}
function clearErrors(form) {
  form.querySelectorAll('.form-group').forEach(g => {
    g.classList.remove('has-error');
    const s = g.querySelector('.error-msg');
    if (s) s.textContent = '';
  });
}

// ----- Modal helpers: openModal('id') / closeModal('id') -----
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ----- Accordion: wrap items as .accordion-item > button.accordion-q + .accordion-a -----
document.querySelectorAll('.accordion-q').forEach(btn => {
  btn.addEventListener('click', () => btn.parentElement.classList.toggle('open'));
});
