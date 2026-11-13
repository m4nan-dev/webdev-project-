// placements.js - stats, CSS bar chart, recruiters, stories, alumni directory and form
async function loadStats() {
  try {
    const s = await api('/api/placements/stats');
    document.getElementById('stats').innerHTML = [['Highest package', s.highest], ['Average package', s.average], ['Students placed', s.placed.toLocaleString('en-IN')]]
      .map(x => `<div class="card"><span class="stat-big">${esc(x[1])}</span>${x[0]}</div>`).join('');
    const max = Math.max(...s.years.map(y => y.placed));
    document.getElementById('chart').innerHTML = s.years.map(y =>
      `<div class="bar"><span>${y.placed}</span><i style="height:${Math.round(y.placed / max * 85)}%"></i><span>${y.year}</span></div>`).join('');
    document.getElementById('recruiters').innerHTML = s.recruiters.concat(s.recruiters).map(r => `<span>${esc(r)}</span>`).join('');
    document.getElementById('stories').innerHTML = s.stories.map(t =>
      `<div class="card"><h3>${esc(t.name)}</h3><p><span class="badge">${esc(t.company)}</span> Batch of ${esc(t.batch)}</p><p>${esc(t.story)}</p></div>`).join('');
  } catch (e) { document.getElementById('stats').innerHTML = '<p class="empty">Placement data could not load. Refresh the page.</p>'; }
}

const batch = document.getElementById('batch');
async function loadAlumni() {
  const box = document.getElementById('alumni');
  try {
    const list = await api('/api/alumni?batch=' + encodeURIComponent(batch.value));
    if (batch.options.length === 1) {                       // fill the batch dropdown once
      [...new Set(list.map(a => a.batch))].forEach(b => batch.insertAdjacentHTML('beforeend', `<option>${b}</option>`));
    }
    box.innerHTML = list.length ? list.map(a => `
      <div class="card"><h3>${esc(a.name)}</h3><p>${esc(a.role)} at ${esc(a.company)}, batch of ${esc(a.batch)}</p>
      <p><em>${esc(a.testimonial)}</em></p></div>`).join('') : '<p class="empty">No alumni listed for this batch yet.</p>';
  } catch (e) { box.innerHTML = '<p class="empty">Alumni could not load. Refresh the page.</p>'; }
}
batch.addEventListener('change', loadAlumni);

const aForm = document.getElementById('alumniForm');
aForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearErrors(aForm);
  const name = document.getElementById('a_name'), yr = document.getElementById('a_batch');
  let ok = true;
  if (!name.value.trim()) { showError(name, 'Enter your name'); ok = false; }
  if (!yr.value) { showError(yr, 'Enter your batch year'); ok = false; }
  if (!ok) return;
  const out = document.getElementById('alumniMsg');
  try {
    await api('/api/alumni', { method: 'POST', body: { name: name.value, batch: yr.value,
      company: document.getElementById('a_company').value, role: document.getElementById('a_role').value,
      testimonial: document.getElementById('a_text').value } });
    aForm.reset();
    showMsg(out, 'Thank you. You are now in the alumni directory.', true);
    batch.innerHTML = '<option value="">All batches</option>';
    loadAlumni();
  } catch (err) { showMsg(out, err.message, false); }
});
loadStats();
loadAlumni();
