// apply.js - admission form: load programs, validate, upload with fetch
const form = document.getElementById('applyForm');
const result = document.getElementById('result');

(async function loadPrograms() {
  try {
    const list = await api('/api/programs');
    document.getElementById('program').insertAdjacentHTML('beforeend',
      list.map(p => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join(''));
  } catch (e) { showMsg(result, 'Programs could not load. Refresh the page.', false); }
})();

form.addEventListener('submit', async e => {
  e.preventDefault();
  clearErrors(form);
  const f = id => document.getElementById(id);
  let ok = true;
  const bad = (id, msg) => { showError(f(id), msg); ok = false; };

  if (!f('name').value.trim()) bad('name', 'Enter your full name');
  if (!f('dob').value) bad('dob', 'Choose your date of birth');
  if (!isPhone(f('phone').value.trim())) bad('phone', 'Phone must be exactly 10 digits');
  if (!isEmail(f('email').value.trim())) bad('email', 'Enter a valid email address');
  ['marks_10', 'marks_12'].forEach(id => {
    const v = Number(f(id).value);
    if (f(id).value === '' || v < 0 || v > 100) bad(id, 'Enter marks between 0 and 100');
  });
  if (!f('program').value) bad('program', 'Choose a program');
  const file = f('document').files[0];
  if (!file) bad('document', 'Attach your documents');
  else if (file.size > 2 * 1024 * 1024) bad('document', 'File is larger than 2 MB');
  if (!ok) return;

  try {
    const res = await api('/api/apply', { method: 'POST', body: new FormData(form) });
    form.classList.add('hidden');
    showMsg(result, 'Application submitted. Your application ID is ' + res.id + '. Keep it safe.', true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) { showMsg(result, err.message, false); }
});
