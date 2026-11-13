// departments.js - one template for every department, chosen by ?dept=cse in the URL

const tabs = document.getElementById('tabs');
const content = document.getElementById('content');
const slug = new URLSearchParams(location.search).get('dept');

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
}

// The API may send labs/research_areas as an array or a JSON string
function toArray(v) {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v) || []; } catch { return []; }
}

// Draw the department buttons, highlight the active one
async function loadTabs() {
  const depts = await api('/api/departments');
  tabs.innerHTML = depts.map(d =>
    `<a class="tab ${d.slug === slug ? 'active' : ''}" href="departments.html?dept=${esc(d.slug)}">${esc(d.name)}</a>`
  ).join('');
  return depts;
}

// Draw one department page
async function loadDepartment(slug) {
  content.innerHTML = '<div class="spinner" role="status">Loading department...</div>';
  try {
    const d = await api(`/api/departments/${encodeURIComponent(slug)}`);
    document.getElementById('title').textContent = d.name;
    document.getElementById('subtitle').textContent = 'Overview, labs, research, and faculty';
    document.title = `${d.name} | UD'S Academy`;

    const labs = toArray(d.labs);
    const research = toArray(d.research_areas);
    const faculty = d.faculty || [];

    content.innerHTML = `
      <section class="card"><h2>Overview</h2><p>${esc(d.overview)}</p></section>

      <section class="card message">
        <div>
          <h2>Head of department</h2>
          <p>${esc(d.hod_message)}</p>
          <p><strong>${esc(d.hod_name)}</strong></p>
        </div>
      </section>

      <section class="grid grid-2">
        <div class="card"><h2>Labs</h2>
          ${labs.length ? '<ul>' + labs.map(l => `<li>${esc(l)}</li>`).join('') + '</ul>' : '<p class="empty">No labs listed yet.</p>'}
        </div>
        <div class="card"><h2>Research areas</h2>
          ${research.length ? '<ul>' + research.map(r => `<li>${esc(r)}</li>`).join('') + '</ul>' : '<p class="empty">No research areas listed yet.</p>'}
        </div>
      </section>

      <section>
        <h2>Faculty in this department</h2>
        ${faculty.length ? `<div class="grid grid-3">` + faculty.map(p => `
          <article class="card faculty-card">
            <img src="${esc(p.photo)}" alt="Photo of ${esc(p.name)}">
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.designation)}</p>
            <p>${esc(p.qualification)}</p>
            <p><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>
          </article>`).join('') + '</div>'
          : '<p class="empty">No faculty listed for this department yet.</p>'}
      </section>`;
  } catch (err) {
    content.innerHTML = '<p class="empty">This department was not found. Pick one from the buttons above.</p>';
  }
}

// Start: draw tabs, then open the department from the URL (or the first one)
loadTabs().then(depts => {
  const first = slug || (depts[0] && depts[0].slug);
  if (first) loadDepartment(first);
}).catch(() => {
  content.innerHTML = '<p class="empty">Departments could not load. Check that the server is running, then refresh.</p>';
});
