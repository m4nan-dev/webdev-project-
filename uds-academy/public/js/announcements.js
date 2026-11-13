// announcements.js - search, type filter, server-side pagination
const list = document.getElementById('list');
const q = document.getElementById('q'), type = document.getElementById('type');
const prev = document.getElementById('prev'), next = document.getElementById('next');
let page = 1, pages = 1;

async function load() {
  list.innerHTML = '<li class="spinner">Loading...</li>';
  try {
    const data = await api(`/api/announcements?type=${type.value}&page=${page}&search=${encodeURIComponent(q.value.trim())}`);
    pages = data.totalPages;
    list.innerHTML = data.items.length ? data.items.map(a => {
      const d = dateParts(a.date);
      return `<li><div class="news-date"><b>${d.day}</b>${d.mon}</div><div><strong>${esc(a.title)}</strong><br><small>${esc(a.body)}</small></div></li>`;
    }).join('') : '<li class="empty">No announcements match your search.</li>';
    document.getElementById('pageInfo').textContent = `Page ${data.page} of ${pages}`;
    prev.disabled = page <= 1; next.disabled = page >= pages;
  } catch (e) { list.innerHTML = '<li class="empty">Announcements could not load. Refresh the page.</li>'; }
}
let t;
q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { page = 1; load(); }, 300); });
type.addEventListener('change', () => { page = 1; load(); });
prev.addEventListener('click', () => { page--; load(); });
next.addEventListener('click', () => { page++; load(); });
load();
