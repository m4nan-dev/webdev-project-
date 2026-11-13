// faculty.js - loads faculty cards from /api/faculty with search and department filter

const list = document.getElementById('list');
const count = document.getElementById('count');
const searchBox = document.getElementById('search');
const deptSelect = document.getElementById('dept');

// Escape text so data from the API cannot inject HTML
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
}

// Fill the department dropdown
async function loadDepartments() {
  try {
    const depts = await api('/api/departments');
    depts.forEach(d => {
      deptSelect.insertAdjacentHTML('beforeend',
        `<option value="${esc(d.slug)}">${esc(d.name)}</option>`);
    });
  } catch (err) {
    console.error('Could not load departments', err);
  }
}

// Load and draw faculty cards
async function loadFaculty() {
  list.innerHTML = '<div class="spinner" role="status">Loading faculty...</div>';
  const q = encodeURIComponent(searchBox.value.trim());
  const d = encodeURIComponent(deptSelect.value);
  try {
    const people = await api(`/api/faculty?search=${q}&dept=${d}`);
    count.textContent = `${people.length} faculty member${people.length === 1 ? '' : 's'} found`;
    if (people.length === 0) {
      list.innerHTML = '<p class="empty">No faculty match your search. Clear the search box or choose All departments.</p>';
      return;
    }
    list.innerHTML = people.map(p => `
      <article class="card faculty-card">
        <img src="${esc(p.photo)}" alt="Photo of ${esc(p.name)}">
        <h3>${esc(p.name)}</h3>
        <p><strong>${esc(p.designation)}</strong>, ${esc(p.department)}</p>
        <p>${esc(p.qualification)}</p>
        <p><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>
      </article>`).join('');
  } catch (err) {
    list.innerHTML = '<p class="empty">Faculty could not load. Check that the server is running, then refresh.</p>';
  }
}

// Wait 300ms after typing stops before searching
let timer;
searchBox.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(loadFaculty, 300);
});
deptSelect.addEventListener('change', loadFaculty);

loadDepartments();
loadFaculty();
