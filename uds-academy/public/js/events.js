// events.js - upcoming/past tabs, date badges, register modal
const list = document.getElementById('list');
let events = [], when = 'upcoming', chosen = null;

function draw() {
  const today = new Date().toISOString().slice(0, 10);
  const shown = events.filter(e => when === 'upcoming' ? e.date >= today : e.date < today);
  if (!shown.length) { list.innerHTML = `<p class="empty">No ${when} events. Check the other tab.</p>`; return; }
  list.innerHTML = shown.map(e => {
    const d = dateParts(e.date);
    return `<article class="card"><span class="badge">${d.day} ${d.mon}</span>
      <h3><a href="event-detail.html?id=${e.id}">${esc(e.title)}</a></h3>
      <p>${esc(e.description)}</p><p><small>${esc(e.location)}</small></p>
      ${when === 'upcoming' ? `<button class="btn" data-id="${e.id}">Register</button>` : ''}</article>`;
  }).join('');
}
async function load() {
  try { events = await api('/api/events'); draw(); }
  catch (e) { list.innerHTML = '<p class="empty">Events could not load. Refresh the page.</p>'; }
}
document.querySelectorAll('[data-when]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-when]').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); when = b.dataset.when; draw();
}));
list.addEventListener('click', e => {
  const b = e.target.closest('button[data-id]');
  if (!b) return;
  chosen = events.find(x => String(x.id) === b.dataset.id);
  document.getElementById('regTitle').textContent = 'Register for ' + chosen.title;
  document.getElementById('regMsg').textContent = '';
  openModal('regModal');
});
document.getElementById('regClose').addEventListener('click', () => closeModal('regModal'));
document.getElementById('regForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target; clearErrors(f);
  const n = document.getElementById('r_name'), m = document.getElementById('r_email');
  let ok = true;
  if (!n.value.trim()) { showError(n, 'Enter your name'); ok = false; }
  if (!isEmail(m.value.trim())) { showError(m, 'Enter a valid email'); ok = false; }
  if (!ok) return;
  const out = document.getElementById('regMsg');
  try {
    await api(`/api/events/${chosen.id}/register`, { method: 'POST', body: { name: n.value, email: m.value } });
    showMsg(out, 'You are registered for ' + chosen.title + '.', true);
    f.reset();
  } catch (err) { showMsg(out, err.message, false); }
});
load();
