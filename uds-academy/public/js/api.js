// api.js - one helper for every call to the backend.
// Usage:  const people = await api('/api/faculty');
//         await api('/api/contact', { method: 'POST', body: { name: 'A' } });
// Login saves the token in localStorage under "token"; it is sent automatically.

async function api(path, options = {}) {
  const headers = {};
  const token = localStorage.getItem(location.pathname.includes('/admin/') ? 'adminToken' : 'token');
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const config = { method: options.method || 'GET', headers };

  if (options.body instanceof FormData) {
    config.body = options.body;                       // file uploads (browser sets the type)
  } else if (options.body) {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(path, config);
  let data = null;
  try { data = await res.json(); } catch (e) { /* empty response */ }

  if (!res.ok) {
    throw new Error((data && data.error) || 'Request failed (' + res.status + ')');
  }
  return data;
}

// Shared helpers used by many pages
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
}
function dateParts(iso) {
  const d = new Date(iso);
  return { day: d.getDate(), mon: d.toLocaleString('en-IN', { month: 'short' }), full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) };
}
function showMsg(el, text, ok) {           // el is any element; ok=true shows green, false shows red
  el.className = ok ? 'success-msg' : 'error-msg';
  el.textContent = text;
}
