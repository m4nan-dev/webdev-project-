// index.js - home page: hero slider, ticker, news tabs, events carousel

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
}
function shortDate(iso) {
  const d = new Date(iso);
  return { day: d.getDate(), mon: d.toLocaleString('en-IN', { month: 'short' }) };
}

// ----- Hero slider (auto-play every 5s, arrows, dots) -----
const slidesBox = document.getElementById('slides');
const slideCount = slidesBox.children.length;
const dotsBox = document.getElementById('dots');
let current = 0;
let autoPlay;

for (let i = 0; i < slideCount; i++) {
  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
  dot.addEventListener('click', () => { showSlide(i); restartAuto(); });
  dotsBox.appendChild(dot);
}
function showSlide(n) {
  current = (n + slideCount) % slideCount;
  slidesBox.style.transform = `translateX(-${current * 100}%)`;
  [...dotsBox.children].forEach((d, i) => d.classList.toggle('active', i === current));
}
function restartAuto() {
  clearInterval(autoPlay);
  autoPlay = setInterval(() => showSlide(current + 1), 5000);
}
document.getElementById('prev').addEventListener('click', () => { showSlide(current - 1); restartAuto(); });
document.getElementById('next').addEventListener('click', () => { showSlide(current + 1); restartAuto(); });
showSlide(0);
restartAuto();

// ----- Ticker: latest announcement titles scroll across -----
async function loadTicker() {
  const box = document.getElementById('ticker');
  try {
    const data = await api('/api/announcements?type=announcement');
    box.innerHTML = data.items.map(a => `<span>${esc(a.title)}</span>`).join('') || '<span>No announcements right now.</span>';
  } catch (err) {
    box.innerHTML = '<span>Announcements could not load.</span>';
  }
}

// ----- News tabs: Announcements | Student news -----
const newsList = document.getElementById('news');
async function loadNews(type) {
  newsList.innerHTML = '<li class="spinner">Loading...</li>';
  try {
    const data = await api('/api/announcements?type=' + type);
    const items = data.items.slice(0, 5);
    newsList.innerHTML = items.length ? items.map(a => {
      const d = shortDate(a.date);
      return `<li><div class="news-date"><b>${d.day}</b>${d.mon}</div>
              <div><strong>${esc(a.title)}</strong><br><small>${esc(a.body)}</small></div></li>`;
    }).join('') : '<li class="empty">Nothing here yet. Check back soon.</li>';
  } catch (err) {
    newsList.innerHTML = '<li class="empty">News could not load. Refresh the page.</li>';
  }
}
document.querySelectorAll('[data-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadNews(btn.dataset.type);
  });
});

// ----- Events carousel: upcoming events first -----
async function loadEvents() {
  const box = document.getElementById('events');
  try {
    const all = await api('/api/events');
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = all.filter(e => e.date >= today);
    const list = upcoming.length ? upcoming : all;      // show everything if none are upcoming
    box.innerHTML = list.map(e => {
      const d = shortDate(e.date);
      return `<a class="card event-card tile" href="pages/event-detail.html?id=${esc(e.id)}">
        <img src="${esc(e.image)}" alt="${esc(e.title)}">
        <div><strong>${esc(e.title)}</strong><br><small>${d.day} ${d.mon}, ${esc(e.location)}</small></div></a>`;
    }).join('');
  } catch (err) {
    box.innerHTML = '<p class="empty">Events could not load. Refresh the page.</p>';
  }
}
document.getElementById('ev-prev').addEventListener('click', () => document.getElementById('events').scrollBy({ left: -300 }));
document.getElementById('ev-next').addEventListener('click', () => document.getElementById('events').scrollBy({ left: 300 }));

loadTicker();
loadNews('announcement');
loadEvents();
