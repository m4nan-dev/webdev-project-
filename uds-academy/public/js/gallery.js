// gallery.js - category filter, lightbox, optional YouTube video
const VIDEO_ID = '';        // paste a YouTube video ID here (the part after v=) to show your campus video

const grid = document.getElementById('grid');
async function load(cat) {
  grid.innerHTML = '<div class="spinner">Loading photos...</div>';
  try {
    const items = await api('/api/gallery?category=' + encodeURIComponent(cat));
    grid.innerHTML = items.length ? items.map(g => `<img src="${esc(g.image)}" alt="${esc(g.title)}" loading="lazy">`).join('')
      : '<p class="empty">No photos in this category yet.</p>';
  } catch (e) { grid.innerHTML = '<p class="empty">Photos could not load. Refresh the page.</p>'; }
}
document.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-cat]').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); load(b.dataset.cat);
}));

const box = document.getElementById('lightbox'), big = document.getElementById('lightImg');
grid.addEventListener('click', e => {
  if (e.target.tagName !== 'IMG') return;
  big.src = e.target.src; big.alt = e.target.alt; box.classList.add('open');
});
box.addEventListener('click', () => box.classList.remove('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') box.classList.remove('open'); });

document.getElementById('videoBox').innerHTML = VIDEO_ID
  ? `<iframe class="video" src="https://www.youtube.com/embed/${encodeURIComponent(VIDEO_ID)}" title="Campus video" allowfullscreen></iframe>`
  : '<p class="empty">Add a YouTube video ID in js/gallery.js to show your campus video here.</p>';
load('');
