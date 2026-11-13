// routes/admin.js - everything here needs an admin login
const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();
router.use(requireAdmin);

const count = t => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;   // t is always a fixed name below

router.get('/stats', (req, res) => {
  res.json({ students: count('students'), applications: count('applications'), messages: count('contacts'),
             events: count('events'), registrations: count('event_registrations'), announcements: count('announcements') });
});

// Create / read / update / delete for announcements and events (names and columns are fixed here)
function crud(table, cols) {
  router.get('/' + table, (req, res) => res.json(db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all()));
  router.post('/' + table, (req, res) => {
    const vals = cols.map(c => String(req.body[c] ?? '').trim());
    if (!vals[0]) return res.status(400).json({ error: 'Title is required' });
    const r = db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...vals);
    res.json({ id: r.lastInsertRowid });
  });
  router.put('/' + table + '/:id', (req, res) => {
    const vals = cols.map(c => String(req.body[c] ?? '').trim());
    if (!vals[0]) return res.status(400).json({ error: 'Title is required' });
    db.prepare(`UPDATE ${table} SET ${cols.map(c => c + ' = ?').join(', ')} WHERE id = ?`).run(...vals, req.params.id);
    res.json({ ok: true });
  });
  router.delete('/' + table + '/:id', (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.json({ ok: true });
  });
}
crud('announcements', ['title', 'body', 'type', 'date']);
crud('events', ['title', 'description', 'date', 'location', 'image']);

router.get('/applications', (req, res) => {
  const s = req.query.status || '';
  res.json(db.prepare(`SELECT * FROM applications WHERE (? = '' OR status = ?) ORDER BY id DESC`).all(s, s));
});
router.put('/applications/:id/status', (req, res) => {
  const status = req.body.status;
  if (!['Pending', 'Accepted', 'Rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

router.get('/contacts', (req, res) => res.json(db.prepare('SELECT * FROM contacts ORDER BY id DESC').all()));
router.get('/registrations', (req, res) => res.json(db.prepare(
  `SELECT r.name, r.email, r.created_at, e.title AS event FROM event_registrations r
   JOIN events e ON e.id = r.event_id ORDER BY r.id DESC`).all()));

// Students: list, and replace one student's results / attendance
router.get('/students', (req, res) => res.json(db.prepare('SELECT id, name, email FROM students ORDER BY id').all()));
router.get('/students/:id', (req, res) => res.json({
  results: db.prepare('SELECT semester, subject, marks, credits FROM results WHERE student_id = ? ORDER BY semester, id').all(req.params.id),
  attendance: db.prepare('SELECT subject, attended, total FROM attendance WHERE student_id = ? ORDER BY id').all(req.params.id)
}));

const num = v => Math.max(0, Number(v) || 0);
router.put('/results/:studentId', (req, res) => {
  const rows = (req.body.rows || []).filter(r => String(r.subject || '').trim());
  db.transaction(() => {
    db.prepare('DELETE FROM results WHERE student_id = ?').run(req.params.studentId);
    const ins = db.prepare('INSERT INTO results (student_id, semester, subject, marks, credits) VALUES (?,?,?,?,?)');
    rows.forEach(r => ins.run(req.params.studentId, num(r.semester), String(r.subject).trim(), Math.min(100, num(r.marks)), num(r.credits)));
  })();
  res.json({ ok: true });
});
router.put('/attendance/:studentId', (req, res) => {
  const rows = (req.body.rows || []).filter(r => String(r.subject || '').trim());
  db.transaction(() => {
    db.prepare('DELETE FROM attendance WHERE student_id = ?').run(req.params.studentId);
    const ins = db.prepare('INSERT INTO attendance (student_id, subject, attended, total) VALUES (?,?,?,?)');
    rows.forEach(r => ins.run(req.params.studentId, String(r.subject).trim(), num(r.attended), num(r.total)));
  })();
  res.json({ ok: true });
});

module.exports = router;
