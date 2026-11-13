// admin.js - admin panel: dashboard, announcements, events, applications, messages, results and attendance
const A = (path, opt) => api('/api/admin' + path, opt);
const panel = document.getElementById('panel');
const loginBox = document.getElementById('loginBox'), app = document.getElementById('app'), logoutBtn = document.getElementById('logout');

function enter() { loginBox.classList.add('hidden'); app.classList.remove('hidden'); logoutBtn.classList.remove('hidden'); show('dash'); }
function leave() { localStorage.removeItem('adminToken'); location.reload(); }
logoutBtn.addEventListener('click', leave);
if (localStorage.getItem('adminToken')) enter();

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const r = await A('/login', { method: 'POST', body: { email: document.getElementById('email').value, password: document.getElementById('pass').value } });
    localStorage.setItem('adminToken', r.token); enter();
  } catch (err) { showMsg(document.getElementById('loginMsg'), err.message, false); }
});

document.getElementById('tabs').addEventListener('click', e => {
  const b = e.target.closest('[data-tab]'); if (!b) return;
  document.querySelectorAll('#tabs .tab').forEach(x => x.classList.remove('active')); b.classList.add('active');
  show(b.dataset.tab);
});

async function show(tab) {
  panel.innerHTML = '<div class="spinner">Loading...</div>';
  try {
    if (tab === 'dash') return dash();
    if (tab === 'announcements') return crudUI('announcements', ['title', 'body', 'type', 'date']);
    if (tab === 'events') return crudUI('events', ['title', 'description', 'date', 'location', 'image']);
    if (tab === 'applications') return applications();
    if (tab === 'messages') return messages();
    if (tab === 'students') return students();
  } catch (err) {
    if (/log in/i.test(err.message)) leave(); else panel.innerHTML = `<p class="empty">${esc(err.message)}</p>`;
  }
}

async function dash() {
  const s = await A('/stats');
  panel.innerHTML = '<div class="grid grid-3">' + Object.entries(s).map(([k, v]) =>
    `<div class="card"><span class="stat-big">${v}</span>${esc(k)}</div>`).join('') + '</div>';
}

// Generic add/edit/delete screen for announcements and events
async function crudUI(res, fields) {
  const rows = await A('/' + res);
  const input = f => f === 'type' ? '<select name="type"><option>announcement</option><option>student</option></select>'
    : f === 'date' ? '<input type="date" name="date">'
    : (f === 'body' || f === 'description') ? `<textarea name="${f}" rows="2"></textarea>` : `<input name="${f}">`;
  panel.innerHTML = `<div id="crudMsg"></div>
    <form id="crudForm" class="card"><h3 id="formTitle">Add new</h3>
      ${fields.map(f => `<div class="form-group"><label>${f}</label>${input(f)}</div>`).join('')}
      <input type="hidden" name="id"><button class="btn" type="submit">Save</button>
      <button class="btn btn-gold" type="button" id="clear">Clear</button></form>
    <div class="table-wrap"><table class="table"><thead><tr><th>${fields[0]}</th><th>${fields[2]}</th><th></th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr><td>${esc(r[fields[0]])}</td><td>${esc(r[fields[2]])}</td>
        <td class="row-actions"><button class="btn" data-edit="${i}">Edit</button><button class="btn btn-gold" data-del="${r.id}">Delete</button></td></tr>`).join('')}
    </tbody></table></div>`;
  const form = document.getElementById('crudForm');
  document.getElementById('clear').onclick = () => { form.reset(); form.id.value = ''; document.getElementById('formTitle').textContent = 'Add new'; };
  form.onsubmit = async e => {
    e.preventDefault();
    const body = Object.fromEntries(fields.map(f => [f, form.elements[f].value]));
    const id = form.elements.id.value;
    try { await A('/' + res + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body }); crudUI(res, fields); }
    catch (err) { showMsg(document.getElementById('crudMsg'), err.message, false); }
  };
  panel.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const r = rows[b.dataset.edit];
    fields.forEach(f => form.elements[f].value = r[f] ?? '');
    form.elements.id.value = r.id; document.getElementById('formTitle').textContent = 'Edit'; window.scrollTo(0, 0);
  });
  panel.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (confirm('Delete this item?')) { await A('/' + res + '/' + b.dataset.del, { method: 'DELETE' }); crudUI(res, fields); }
  });
}

async function applications() {
  const rows = await A('/applications');
  panel.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Program</th><th>Phone</th><th>Email</th><th>10th / 12th</th><th>Document</th><th>Status</th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${esc(r.name)}</td><td>${esc(r.program)}</td><td>${esc(r.phone)}</td><td>${esc(r.email)}</td><td>${r.marks_10}% / ${r.marks_12}%</td>
      <td>${r.document ? `<a href="/uploads/applications/${encodeURIComponent(r.document)}" target="_blank" rel="noopener">View</a>` : 'none'}</td>
      <td><select data-id="${r.id}">${['Pending', 'Accepted', 'Rejected'].map(s => `<option${s === r.status ? ' selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')
      || '<tr><td colspan="7">No applications yet.</td></tr>'}</tbody></table></div>`;
  panel.querySelectorAll('select').forEach(s => s.onchange = () => A(`/applications/${s.dataset.id}/status`, { method: 'PUT', body: { status: s.value } }));
}

async function messages() {
  const [c, r] = await Promise.all([A('/contacts'), A('/registrations')]);
  panel.innerHTML = `<h2>Contact messages</h2><div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th></tr></thead><tbody>
    ${c.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.subject)}</td><td>${esc(m.message)}</td></tr>`).join('') || '<tr><td colspan="4">No messages yet.</td></tr>'}</tbody></table></div>
    <h2>Event registrations</h2><div class="table-wrap"><table class="table"><thead><tr><th>Event</th><th>Name</th><th>Email</th></tr></thead><tbody>
    ${r.map(x => `<tr><td>${esc(x.event)}</td><td>${esc(x.name)}</td><td>${esc(x.email)}</td></tr>`).join('') || '<tr><td colspan="3">No registrations yet.</td></tr>'}</tbody></table></div>`;
}

// Editable table helper: rows is an array of objects, cols are their keys
function editTable(el, title, rows, cols, save) {
  const draw = () => {
    el.innerHTML = `<h3>${title}</h3><div class="table-wrap"><table class="table"><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>
      ${rows.map((r, i) => `<tr>${cols.map(c => `<td><input data-i="${i}" data-c="${c}" value="${esc(r[c])}"></td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <button class="btn" data-add>Add row</button> <button class="btn btn-gold" data-save>Save ${title.toLowerCase()}</button> <span data-note></span>`;
    el.querySelectorAll('input').forEach(inp => inp.oninput = () => { rows[inp.dataset.i][inp.dataset.c] = inp.value; });
    el.querySelector('[data-add]').onclick = () => { rows.push(Object.fromEntries(cols.map(c => [c, '']))); draw(); };
    el.querySelector('[data-save]').onclick = async () => {
      try { await save(rows); showMsg(el.querySelector('[data-note]'), 'Saved.', true); }
      catch (err) { showMsg(el.querySelector('[data-note]'), err.message, false); }
    };
  };
  draw();
}

async function students() {
  const list = await A('/students');
  panel.innerHTML = `<div class="form-group"><label for="stu">Student</label><select id="stu"><option value="">Choose a student</option>
    ${list.map(s => `<option value="${s.id}">${esc(s.name)} (${esc(s.email)})</option>`).join('')}</select></div>
    <div id="resBox" class="card"></div><div id="attBox" class="card"></div>`;
  document.getElementById('stu').onchange = async e => {
    if (!e.target.value) return;
    const id = e.target.value, d = await A('/students/' + id);
    editTable(document.getElementById('resBox'), 'Results', d.results, ['semester', 'subject', 'marks', 'credits'], rows => A('/results/' + id, { method: 'PUT', body: { rows } }));
    editTable(document.getElementById('attBox'), 'Attendance', d.attendance, ['subject', 'attended', 'total'], rows => A('/attendance/' + id, { method: 'PUT', body: { rows } }));
  };
}
