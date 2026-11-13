// components.js - builds the top bar, navbar, and footer on every page.
// Every page needs <div id="navbar"></div> and <div id="footer"></div>.

// Pages inside /pages/ or /admin/ are one folder deep, so links need "../"
const inSubfolder = /\/(pages|admin)\//.test(location.pathname);
const root = inSubfolder ? '../' : '';
const P = root + 'pages/';

const menu = [
  { label: 'About', items: [
    ['About Academy', P + 'about.html'], ["Director's Message", P + 'about.html#messages'], ['Governance', P + 'about.html#governance']] },
  { label: 'Academics', items: [
    ['Departments', P + 'departments.html'], ['Programs', P + 'courses.html'],
    ['Curriculum', P + 'curriculum.html'], ['Academic Calendar', P + 'calendar.html']] },
  { label: 'Admission', items: [
    ['Admission Info', P + 'admission.html'], ['Fee Structure', P + 'admission.html#fees'],
    ['Scholarship', P + 'admission.html#scholarship'], ['Apply Online', P + 'apply.html']] },
  { label: 'People', items: [['Faculty', P + 'faculty.html']] },
  { label: 'Student Corner', items: [
    ['Library', P + 'facilities.html#library'], ['Clubs', P + 'clubs.html'],
    ['Hostel', P + 'facilities.html#hostel'], ['Student Portal', P + 'login.html']] },
  { label: 'Placements', link: P + 'placements.html' },
  { label: 'Events and Gallery', items: [
    ['Events', P + 'events.html'], ['Gallery', P + 'gallery.html'], ['Announcements', P + 'announcements.html']] },
  { label: 'Contact', link: P + 'contact.html' }
];

function buildNavbar() {
  const links = menu.map(m => {
    if (m.link) return `<li><a href="${m.link}">${m.label}</a></li>`;
    const sub = m.items.map(i => `<li><a href="${i[1]}">${i[0]}</a></li>`).join('');
    return `<li class="has-dropdown"><a href="#">${m.label}</a><ul class="dropdown">${sub}</ul></li>`;
  }).join('');

  return `
    <div class="topbar"><div class="inner">
      <span>Call: +91 98765 43210</span>
      <span><a href="${P}contact.html">Careers</a><a href="${P}contact.html">Tenders</a><a href="${P}contact.html">Contact</a></span>
    </div></div>
    <nav class="navbar" aria-label="Main"><div class="inner">
      <a class="brand" href="${root}index.html">
        <span class="logo" aria-hidden="true">UD</span>
        <span class="brand-name">UD&apos;S Academy<span class="brand-tag">Learn. Build. Lead.</span></span>
      </a>
      <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">&#9776;</button>
      <ul class="nav-links" id="nav-links">${links}</ul>
    </div></nav>`;
}

function buildFooter() {
  return `
    <footer class="footer">
      <div class="inner">
        <div><h3>UD&apos;S Academy</h3>
          <p>Learn. Build. Lead.<br>12 College Road, Kota, Rajasthan 324001<br>info@udsacademy.com</p></div>
        <div><h3>Quick links</h3>
          <a href="${P}admission.html">Admission</a><a href="${P}faculty.html">Faculty</a>
          <a href="${P}placements.html">Placements</a><a href="${P}events.html">Events</a></div>
        <div><h3>Follow us</h3>
          <a href="#">Facebook</a><a href="#">Instagram</a><a href="#">LinkedIn</a><a href="#">YouTube</a></div>
      </div>
      <div class="copy">&copy; ${new Date().getFullYear()} UD&apos;S Academy. All rights reserved.</div>
    </footer>`;
}

const navEl = document.getElementById('navbar');
const footEl = document.getElementById('footer');
if (navEl) navEl.innerHTML = buildNavbar();
if (footEl) footEl.innerHTML = buildFooter();
