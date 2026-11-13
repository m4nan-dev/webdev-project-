// event-detail.js - one event loaded by ?id=
const box = document.getElementById('detail');
const id = new URLSearchParams(location.search).get('id');

(async function () {
  try {
    const e = await api('/api/events/' + encodeURIComponent(id));
    const d = dateParts(e.date);
    document.title = e.title + " | UD'S Academy";
    box.innerHTML = `<article class="card"><img src="${esc(e.image)}" alt="${esc(e.title)}" style="width:100%;max-height:320px;object-fit:cover;border-radius:8px">
      <h2>${esc(e.title)}</h2><p><span class="badge">${esc(d.full)}</span> ${esc(e.location)}</p><p>${esc(e.description)}</p>
      <button class="btn" id="open">Register</button> <a class="btn btn-gold" href="events.html">All events</a></article>`;
    document.getElementById('open').addEventListener('click', () => openModal('regModal'));
  } catch (err) { box.innerHTML = '<p class="empty">This event was not found. <a href="events.html">See all events</a>.</p>'; }
})();
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
    await api(`/api/events/${encodeURIComponent(id)}/register`, { method: 'POST', body: { name: n.value, email: m.value } });
    showMsg(out, 'You are registered.', true); f.reset();
  } catch (err) { showMsg(out, err.message, false); }
});
