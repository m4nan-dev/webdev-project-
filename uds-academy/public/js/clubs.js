// clubs.js - club cards with a Join button (needs student login)
const list = document.getElementById('list');
const msg = document.getElementById('msg');

async function load() {
  try {
    const clubs = await api('/api/clubs');
    list.innerHTML = clubs.map(c => `
      <article class="card"><span class="badge">${esc(c.category)}</span>
        <h3>${esc(c.name)}</h3><p>${esc(c.description)}</p>
        <button class="btn" data-id="${c.id}">Join club</button></article>`).join('');
  } catch (e) { list.innerHTML = '<p class="empty">Clubs could not load. Refresh the page.</p>'; }
}
list.addEventListener('click', async e => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  if (!localStorage.getItem('token')) { location.href = 'login.html'; return; }
  try {
    await api(`/api/clubs/${btn.dataset.id}/join`, { method: 'POST' });
    btn.textContent = 'Joined';
    btn.disabled = true;
  } catch (err) {
    if (/log in/i.test(err.message)) { localStorage.removeItem('token'); location.href = 'login.html'; }
    else showMsg(msg, err.message, false);
  }
});
load();
