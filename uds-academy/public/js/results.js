// results.js - marks by semester with SGPA and CGPA (grade points = marks / 10, weighted by credits)
if (!localStorage.getItem('token')) location.href = 'login.html';

const gp = marks => Math.min(10, marks / 10);

(async function () {
  try {
    const rows = await api('/api/student/results');
    if (!rows.length) { document.getElementById('sems').innerHTML = '<p class="empty">No results published yet.</p>'; document.getElementById('cgpa').textContent = 'n/a'; return; }
    const bySem = {};
    rows.forEach(r => (bySem[r.semester] = bySem[r.semester] || []).push(r));
    let allPoints = 0, allCredits = 0, html = '';
    Object.keys(bySem).forEach(sem => {
      const list = bySem[sem];
      const points = list.reduce((s, r) => s + gp(r.marks) * r.credits, 0);
      const credits = list.reduce((s, r) => s + r.credits, 0);
      allPoints += points; allCredits += credits;
      html += `<h2>Semester ${esc(sem)}: SGPA ${credits ? (points / credits).toFixed(2) : 'n/a'}</h2>
        <div class="table-wrap"><table class="table"><thead><tr><th>Subject</th><th>Credits</th><th>Marks</th><th>Grade point</th></tr></thead><tbody>
        ${list.map(r => `<tr><td>${esc(r.subject)}</td><td>${r.credits}</td><td>${r.marks}</td><td>${gp(r.marks).toFixed(1)}</td></tr>`).join('')}
        </tbody></table></div>`;
    });
    document.getElementById('sems').innerHTML = html;
    document.getElementById('cgpa').textContent = allCredits ? (allPoints / allCredits).toFixed(2) : 'n/a';
  } catch (e) { localStorage.removeItem('token'); location.href = 'login.html'; }
})();
