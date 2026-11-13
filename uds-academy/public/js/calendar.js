// calendar.js - academic calendar table with a month filter
// /api/calendar returns: [{ date: "2026-08-03", title: "...", type: "Exam" }, ...]

const rows = document.getElementById('rows');
const monthSelect = document.getElementById('month');
let events = [];

const MONTHS = ['January','February','March','April','May','June','July',
  'August','September','October','November','December'];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
}

// Draw only the rows that match the selected month ("" = all)
function draw() {
  const m = monthSelect.value;
  const shown = events.filter(e => m === '' || new Date(e.date).getMonth() === Number(m));
  if (shown.length === 0) {
    rows.innerHTML = '<tr><td colspan="3">No events this month. Choose another month.</td></tr>';
    return;
  }
  rows.innerHTML = shown.map(e => `
    <tr>
      <td>${new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
      <td>${esc(e.title)}</td>
      <td>${esc(e.type)}</td>
    </tr>`).join('');
}

async function init() {
  monthSelect.innerHTML = '<option value="">All months</option>' +
    MONTHS.map((name, i) => `<option value="${i}">${name}</option>`).join('');
  try {
    events = await api('/api/calendar');
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    draw();
  } catch (err) {
    rows.innerHTML = '<tr><td colspan="3">Calendar could not load. Check that the server is running, then refresh.</td></tr>';
  }
}

monthSelect.addEventListener('change', draw);
init();
