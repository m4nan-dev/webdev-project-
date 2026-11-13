// dashboard.js - student home: attendance, exams, profile, password. Needs login.
if (!localStorage.getItem('token')) location.href = 'login.html';

function logout() { localStorage.removeItem('token'); localStorage.removeItem('studentName'); location.href = 'login.html'; }
document.getElementById('logout').addEventListener('click', logout);

async function load() {
  try {
    const me = await api('/api/student/me');
    document.getElementById('welcome').textContent = 'Welcome, ' + me.name;
    document.getElementById('info').textContent = `${me.department}, semester ${me.semester}. ${me.email}`;
    document.getElementById('p_name').value = me.name;
    document.getElementById('p_phone').value = me.phone || '';

    const att = await api('/api/student/attendance');
    const attended = att.reduce((s, a) => s + a.attended, 0), total = att.reduce((s, a) => s + a.total, 0);
    const pct = total ? Math.round(attended / total * 100) : 0;
    document.getElementById('attPct').textContent = pct + '%';
    document.getElementById('attWarn').textContent = pct < 75 ? 'Below 75%. You may not be allowed to sit exams.' : 'Good. Keep it above 75%.';
    document.getElementById('attRows').innerHTML = att.length ? att.map(a => {
      const p = a.total ? Math.round(a.attended / a.total * 100) : 0;
      return `<tr><td>${esc(a.subject)}</td><td>${a.attended}</td><td>${a.total}</td><td class="${p < 75 ? 'low' : ''}">${p}%${p < 75 ? ' (low)' : ''}</td></tr>`;
    }).join('') : '<tr><td colspan="4">No attendance recorded yet.</td></tr>';

    const cal = await api('/api/calendar');
    const today = new Date().toISOString().slice(0, 10);
    const exams = cal.filter(c => c.type === 'Exam' && c.date >= today).slice(0, 4);
    document.getElementById('exams').innerHTML = exams.length
      ? exams.map(x => `<li>${dateParts(x.date).full}: ${esc(x.title)}</li>`).join('') : '<li>No upcoming exams listed.</li>';
  } catch (err) { logout(); }          // token missing or expired
}

document.getElementById('profileForm').addEventListener('submit', async e => {
  e.preventDefault(); clearErrors(e.target);
  const ph = document.getElementById('p_phone'), nm = document.getElementById('p_name');
  const out = document.getElementById('pMsg');
  if (!nm.value.trim()) return showError(nm, 'Enter your name');
  if (ph.value && !isPhone(ph.value)) return showError(ph, 'Phone must be 10 digits');
  try { await api('/api/student/me', { method: 'PUT', body: { name: nm.value, phone: ph.value } }); showMsg(out, 'Profile saved.', true); load(); }
  catch (err) { showMsg(out, err.message, false); }
});
document.getElementById('pwForm').addEventListener('submit', async e => {
  e.preventDefault(); clearErrors(e.target);
  const cur = document.getElementById('w_cur'), nw = document.getElementById('w_new'), out = document.getElementById('wMsg');
  if (!cur.value) return showError(cur, 'Enter your current password');
  if (nw.value.length < 6) return showError(nw, 'Use at least 6 characters');
  try { await api('/api/student/password', { method: 'PUT', body: { current: cur.value, next: nw.value } }); e.target.reset(); showMsg(out, 'Password changed.', true); }
  catch (err) { showMsg(out, err.message, false); }
});
load();
