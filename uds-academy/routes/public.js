// routes/public.js - read-only endpoints anyone can call (no login needed)
const express = require('express');
const db = require('../db');
const router = express.Router();

// Labs and research areas are stored as JSON text; turn them back into arrays
const parseList = v => { try { return JSON.parse(v) || []; } catch (e) { return []; } };

// GET /api/departments -> list for dropdowns and tabs
router.get('/departments', (req, res) => {
  res.json(db.prepare('SELECT id, name, slug FROM departments ORDER BY id').all());
});

// GET /api/departments/:slug -> one department with its faculty
router.get('/departments/:slug', (req, res) => {
  const d = db.prepare('SELECT * FROM departments WHERE slug = ?').get(req.params.slug);
  if (!d) return res.status(404).json({ error: 'Department not found' });
  d.labs = parseList(d.labs);
  d.research_areas = parseList(d.research_areas);
  d.faculty = db.prepare(`SELECT name, designation, qualification, email, photo
                          FROM faculty WHERE department_id = ? ORDER BY id`).all(d.id);
  res.json(d);
});

// GET /api/faculty?search=&dept=
router.get('/faculty', (req, res) => {
  const search = '%' + (req.query.search || '') + '%';
  const dept = req.query.dept || '';
  const rows = db.prepare(`
    SELECT f.name, f.designation, f.qualification, f.email, f.photo, d.name AS department
    FROM faculty f JOIN departments d ON d.id = f.department_id
    WHERE f.name LIKE ? AND (? = '' OR d.slug = ?)
    ORDER BY f.id`).all(search, dept, dept);
  res.json(rows);
});

// GET /api/programs
router.get('/programs', (req, res) => {
  res.json(db.prepare('SELECT name, level, duration, seats, eligibility FROM programs ORDER BY id').all());
});

// GET /api/curriculum?dept=cse&semester=1
router.get('/curriculum', (req, res) => {
  res.json(db.prepare(`
    SELECT c.semester, c.subject_code, c.subject_name, c.credits
    FROM curriculum c JOIN departments d ON d.id = c.department_id
    WHERE d.slug = ? AND (? = '' OR c.semester = ?) ORDER BY c.semester, c.id`)
    .all(req.query.dept || '', req.query.semester || '', Number(req.query.semester) || 0));
});

// GET /api/calendar
router.get('/calendar', (req, res) => {
  res.json(db.prepare('SELECT date, title, type FROM calendar ORDER BY date').all());
});

// GET /api/announcements?type=announcement|student&page=1&search=
router.get('/announcements', (req, res) => {
  const type = req.query.type || '';
  const search = '%' + (req.query.search || '') + '%';
  const page = Math.max(1, Number(req.query.page) || 1);
  const size = 6;
  const where = `WHERE (? = '' OR type = ?) AND title LIKE ?`;
  const total = db.prepare(`SELECT COUNT(*) AS n FROM announcements ${where}`).get(type, type, search).n;
  const items = db.prepare(`SELECT id, title, body, type, date FROM announcements ${where}
                            ORDER BY date DESC LIMIT ? OFFSET ?`).all(type, type, search, size, (page - 1) * size);
  res.json({ items, page, totalPages: Math.max(1, Math.ceil(total / size)) });
});

// GET /api/events and /api/events/:id
router.get('/events', (req, res) => {
  res.json(db.prepare('SELECT * FROM events ORDER BY date').all());
});
router.get('/events/:id', (req, res) => {
  const e = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!e) return res.status(404).json({ error: 'Event not found' });
  res.json(e);
});

// ---------- Gallery, placements, alumni, clubs ----------
router.get('/gallery', (req, res) => {
  const c = req.query.category || '';
  res.json(db.prepare(`SELECT title, category, image FROM gallery WHERE (? = '' OR category = ?) ORDER BY id`).all(c, c));
});

router.get('/placements/stats', (req, res) => res.json({
  highest: '24 LPA', average: '7.2 LPA', placed: 1800,
  years: [{ year: 2021, placed: 280 }, { year: 2022, placed: 310 }, { year: 2023, placed: 345 }, { year: 2024, placed: 390 }, { year: 2025, placed: 430 }],
  recruiters: ['Infosys', 'TCS', 'Wipro', 'Accenture', 'Capgemini', 'Zoho', 'Amazon', 'Cognizant', 'Tech Mahindra', 'Deloitte'],
  stories: [
    { name: 'Aditi Verma', batch: 2024, company: 'Amazon', story: 'Built three projects in college and cracked the interview with them.' },
    { name: 'Kunal Shah', batch: 2023, company: 'Zoho', story: 'The embedded systems lab helped me land a hardware role.' },
    { name: 'Neha Reddy', batch: 2024, company: 'Deloitte', story: 'Mock interviews at the training cell made the real one easy.' },
    { name: 'Manish Joshi', batch: 2022, company: 'Infosys', story: 'I joined as a trainee and was promoted within two years.' }
  ]
}));

router.get('/alumni', (req, res) => {
  const b = req.query.batch || '';
  res.json(db.prepare(`SELECT name, batch, company, role, testimonial FROM alumni WHERE (? = '' OR batch = ?) ORDER BY batch DESC, id`).all(b, b));
});

router.get('/clubs', (req, res) => res.json(db.prepare('SELECT id, name, description, category FROM clubs ORDER BY id').all()));

// ---------- Forms anyone can submit ----------
const clean = (v, n = 200) => String(v || '').trim().slice(0, n);
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

router.post('/alumni', (req, res) => {
  const name = clean(req.body.name), batch = Number(req.body.batch);
  if (!name || !batch) return res.status(400).json({ error: 'Name and batch year are required' });
  db.prepare('INSERT INTO alumni (name, batch, company, role, testimonial) VALUES (?,?,?,?,?)')
    .run(name, batch, clean(req.body.company), clean(req.body.role), clean(req.body.testimonial, 500));
  res.json({ ok: true });
});

router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!clean(name) || !emailOk(clean(email)) || !clean(message)) return res.status(400).json({ error: 'Name, a valid email, and a message are required' });
  db.prepare('INSERT INTO contacts (name, email, subject, message) VALUES (?,?,?,?)')
    .run(clean(name), clean(email), clean(subject), clean(message, 2000));
  res.json({ ok: true });
});

router.post('/events/:id/register', (req, res) => {
  const e = db.prepare('SELECT id FROM events WHERE id = ?').get(req.params.id);
  if (!e) return res.status(404).json({ error: 'Event not found' });
  if (!clean(req.body.name) || !emailOk(clean(req.body.email))) return res.status(400).json({ error: 'Enter your name and a valid email' });
  db.prepare('INSERT INTO event_registrations (event_id, name, email) VALUES (?,?,?)').run(e.id, clean(req.body.name), clean(req.body.email));
  res.json({ ok: true });
});

// ---------- Admission application with document upload (pdf/jpg/png, max 2 MB) ----------
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, '..', 'uploads', 'applications');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, f, cb) => cb(null, Date.now() + '-' + f.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'))
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, f, cb) => cb(null, /\.(pdf|jpe?g|png)$/i.test(f.originalname))
});

router.post('/apply', (req, res) => {
  upload.single('document')(req, res, err => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'The document is larger than 2 MB' : 'Upload failed' });
    const b = req.body;
    const m10 = Number(b.marks_10), m12 = Number(b.marks_12);
    if (!clean(b.name) || !clean(b.dob) || !clean(b.program)) return res.status(400).json({ error: 'Name, date of birth, and program are required' });
    if (!/^\d{10}$/.test(clean(b.phone))) return res.status(400).json({ error: 'Phone must be 10 digits' });
    if (!emailOk(clean(b.email))) return res.status(400).json({ error: 'Enter a valid email address' });
    if (!(m10 >= 0 && m10 <= 100 && m12 >= 0 && m12 <= 100)) return res.status(400).json({ error: 'Marks must be between 0 and 100' });
    const r = db.prepare(`INSERT INTO applications (name, dob, phone, email, marks_10, marks_12, program, document)
                          VALUES (?,?,?,?,?,?,?,?)`)
      .run(clean(b.name), clean(b.dob), clean(b.phone), clean(b.email), m10, m12, clean(b.program), req.file ? req.file.filename : '');
    res.json({ id: 'UDS-' + String(r.lastInsertRowid).padStart(5, '0') });
  });
});

module.exports = router;
