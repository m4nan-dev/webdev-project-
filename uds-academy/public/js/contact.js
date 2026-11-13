// contact.js - validated contact form
const form = document.getElementById('contactForm');
form.addEventListener('submit', async e => {
  e.preventDefault();
  clearErrors(form);
  const n = document.getElementById('c_name'), m = document.getElementById('c_email'), msg = document.getElementById('c_message');
  let ok = true;
  if (!n.value.trim()) { showError(n, 'Enter your name'); ok = false; }
  if (!isEmail(m.value.trim())) { showError(m, 'Enter a valid email address'); ok = false; }
  if (!msg.value.trim()) { showError(msg, 'Write a message'); ok = false; }
  if (!ok) return;
  const out = document.getElementById('result');
  try {
    await api('/api/contact', { method: 'POST', body: { name: n.value, email: m.value, subject: document.getElementById('c_subject').value, message: msg.value } });
    form.reset();
    showMsg(out, 'Thank you. We received your message and will reply soon.', true);
  } catch (err) { showMsg(out, err.message, false); }
});
