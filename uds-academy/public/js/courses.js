// courses.js - programs table and syllabus links (year > semester)

const programsBody = document.getElementById('programs');
const deptSelect = document.getElementById('dept');
const syllabus = document.getElementById('syllabus');

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
}

// Programs table
async function loadPrograms() {
  try {
    const rows = await api('/api/programs');
    programsBody.innerHTML = rows.length ? rows.map(p => `
      <tr>
        <td>${esc(p.name)}</td><td>${esc(p.level)}</td><td>${esc(p.duration)}</td>
        <td>${esc(p.seats)}</td><td>${esc(p.eligibility)}</td>
      </tr>`).join('') : '<tr><td colspan="5">No courses listed yet.</td></tr>';
  } catch (err) {
    programsBody.innerHTML = '<tr><td colspan="5">Courses could not load. Refresh the page.</td></tr>';
  }
}

// Draw 8 semester cards for the chosen department.
// Each link points to /uploads/syllabus/<dept>-sem<N>.pdf (put your PDFs there).
function drawSyllabus() {
  const dept = deptSelect.value;
  let html = '';
  for (let sem = 1; sem <= 8; sem++) {
    const year = Math.ceil(sem / 2);
    html += `
      <div class="card">
        <h3>Semester ${sem}</h3>
        <p>Year ${year}</p>
        <a class="btn" href="/uploads/syllabus/${esc(dept)}-sem${sem}.pdf" download>Download PDF</a>
      </div>`;
  }
  syllabus.innerHTML = html;
}

async function init() {
  loadPrograms();
  try {
    const depts = await api('/api/departments');
    deptSelect.innerHTML = depts.map(d => `<option value="${esc(d.slug)}">${esc(d.name)}</option>`).join('');
    drawSyllabus();
  } catch (err) {
    syllabus.innerHTML = '<p class="empty">Syllabus links could not load. Refresh the page.</p>';
  }
}

deptSelect.addEventListener('change', drawSyllabus);
init();
