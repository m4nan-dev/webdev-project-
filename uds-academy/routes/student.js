// routes/student.js - endpoints that need a student login
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireStudent } = require('../middleware/auth');
const router = express.Router();

// GET /api/student/me
router.get('/student/me', requireStudent, (req, res) => {
  const s = db.prepare(`SELECT s.name, s.email, s.phone, s.semester, d.name AS department
                        FROM students s LEFT JOIN departments d ON d.id = s.department_id WHERE s.id = ?`).get(req.user.id);
  if (!s) return res.status(401).json({ error: 'Please log in again' });
  res.json(s);
});

// PUT /api/student/me  (edit name and phone)
router.put('/student/me', requireStudent, (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 100);
  const phone = String(req.body.phone || '').trim();
  if (!name) return res.status(400).json({ error: 'Enter your name' });
  if (phone && !/^\d{10}$/.test(phone)) return res.status(400).json({ error: 'Phone must be 10 digits' });
  db.prepare('UPDATE students SET name = ?, phone = ? WHERE id = ?').run(name, phone, req.user.id);
  res.json({ ok: true });
});

// PUT /api/student/password
router.put('/student/password', requireStudent, (req, res) => {
  const s = db.prepare('SELECT password FROM students WHERE id = ?').get(req.user.id);
  if (!s || !bcrypt.compareSync(String(req.body.current || ''), s.password))
    return res.status(400).json({ error: 'Current password is incorrect' });
  const next = String(req.body.next || '');
  if (next.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  db.prepare('UPDATE students SET password = ? WHERE id = ?').run(bcrypt.hashSync(next, 10), req.user.id);
  res.json({ ok: true });
});

router.get('/student/attendance', requireStudent, (req, res) => {
  res.json(db.prepare('SELECT subject, attended, total FROM attendance WHERE student_id = ? ORDER BY id').all(req.user.id));
});
router.get('/student/results', requireStudent, (req, res) => {
  res.json(db.prepare('SELECT semester, subject, marks, credits FROM results WHERE student_id = ? ORDER BY semester, id').all(req.user.id));
});

// POST /api/clubs/:id/join
router.post('/clubs/:id/join', requireStudent, (req, res) => {
  const club = db.prepare('SELECT id FROM clubs WHERE id = ?').get(req.params.id);
  if (!club) return res.status(404).json({ error: 'Club not found' });
  if (!db.prepare('SELECT id FROM club_members WHERE club_id = ? AND student_id = ?').get(club.id, req.user.id))
    db.prepare('INSERT INTO club_members (club_id, student_id) VALUES (?,?)').run(club.id, req.user.id);
  res.json({ ok: true });
});

module.exports = router;
