// curriculum.js - subject table that reloads when department or semester changes
const dept = document.getElementById('dept');
const sem = document.getElementById('sem');
const rows = document.getElementById('rows');

async function load() {
  rows.innerHTML = '<tr><td colspan="3">Loading subjects...</td></tr>';
  try {
    const list = await api(`/api/curriculum?dept=${encodeURIComponent(dept.value)}&semester=${sem.value}`);
    rows.innerHTML = list.length ? list.map(s =>
      `<tr><td>${esc(s.subject_code)}</td><td>${esc(s.subject_name)}</td><td>${esc(s.credits)}</td></tr>`).join('')
      : '<tr><td colspan="3">No subjects listed for this semester.</td></tr>';
  } catch (e) { rows.innerHTML = '<tr><td colspan="3">Subjects could not load. Refresh the page.</td></tr>'; }
}
(async function init() {
  try {
    const d = await api('/api/departments');
    dept.innerHTML = d.map(x => `<option value="${esc(x.slug)}">${esc(x.name)}</option>`).join('');
    load();
  } catch (e) { rows.innerHTML = '<tr><td colspan="3">Departments could not load.</td></tr>'; }
})();
dept.addEventListener('change', load);
sem.addEventListener('change', load);
