// login.js - login and signup tabs, password strength, show/hide password
const msg = document.getElementById('msg');
const loginForm = document.getElementById('loginForm'), signupForm = document.getElementById('signupForm');

document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-tab]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  loginForm.classList.toggle('hidden', b.dataset.tab !== 'login');
  signupForm.classList.toggle('hidden', b.dataset.tab !== 'signup');
  msg.textContent = ''; msg.className = '';
}));

document.getElementById('showPw').addEventListener('change', e =>
  document.querySelectorAll('.pw').forEach(i => i.type = e.target.checked ? 'text' : 'password'));

// Strength: one point each for length 8+, lower+upper, a digit, a symbol
document.getElementById('s_pass').addEventListener('input', e => {
  const v = e.target.value;
  const score = (v.length >= 8) + (/[a-z]/.test(v) && /[A-Z]/.test(v)) + /\d/.test(v) + /[^A-Za-z0-9]/.test(v);
  const bar = document.getElementById('bar');
  bar.style.width = (v ? score * 25 : 0) + '%';
  bar.style.background = score <= 1 ? 'var(--danger)' : score <= 2 ? 'var(--gold)' : 'var(--ok)';
  document.getElementById('strengthText').textContent = v ? ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score] : '';
});

(async () => {
  try {
    const d = await api('/api/departments');
    document.getElementById('s_dept').innerHTML = d.map(x => `<option value="${esc(x.slug)}">${esc(x.name)}</option>`).join('');
  } catch (e) { /* signup still works with the default department */ }
})();

function done(res) {
  localStorage.setItem('token', res.token);
  localStorage.setItem('studentName', res.student.name);
  location.href = 'dashboard.html';
}
loginForm.addEventListener('submit', async e => {
  e.preventDefault(); clearErrors(loginForm);
  const em = document.getElementById('l_email'), pw = document.getElementById('l_pass');
  let ok = true;
  if (!isEmail(em.value.trim())) { showError(em, 'Enter a valid email'); ok = false; }
  if (!pw.value) { showError(pw, 'Enter your password'); ok = false; }
  if (!ok) return;
  try { done(await api('/api/auth/login', { method: 'POST', body: { email: em.value, password: pw.value } })); }
  catch (err) { showMsg(msg, err.message, false); }
});
signupForm.addEventListener('submit', async e => {
  e.preventDefault(); clearErrors(signupForm);
  const n = document.getElementById('s_name'), em = document.getElementById('s_email'), pw = document.getElementById('s_pass');
  let ok = true;
  if (!n.value.trim()) { showError(n, 'Enter your name'); ok = false; }
  if (!isEmail(em.value.trim())) { showError(em, 'Enter a valid email'); ok = false; }
  if (pw.value.length < 6) { showError(pw, 'Use at least 6 characters'); ok = false; }
  if (!ok) return;
  try { done(await api('/api/auth/signup', { method: 'POST', body: { name: n.value, email: em.value, password: pw.value, department: document.getElementById('s_dept').value } })); }
  catch (err) { showMsg(msg, err.message, false); }
});
