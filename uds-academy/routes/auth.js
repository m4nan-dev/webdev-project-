// routes/auth.js - signup and login for students, login for admin
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { sign } = require('../middleware/auth');
const router = express.Router();

const clean = v => String(v || '').trim().slice(0, 200);
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// POST /api/auth/signup
router.post('/auth/signup', (req, res) => {
  const name = clean(req.body.name), email = clean(req.body.email).toLowerCase();
  const password = String(req.body.password || '');
  if (!name) return res.status(400).json({ error: 'Enter your name' });
  if (!emailOk(email)) return res.status(400).json({ error: 'Enter a valid email address' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (db.prepare('SELECT id FROM students WHERE email = ?').get(email))
    return res.status(400).json({ error: 'This email is already registered. Log in instead.' });

  const dept = db.prepare('SELECT id FROM departments WHERE slug = ?').get(clean(req.body.department)) || { id: 1 };
  const info = db.prepare('INSERT INTO students (name, email, password, department_id, semester, phone) VALUES (?,?,?,?,?,?)')
    .run(name, email, bcrypt.hashSync(password, 10), dept.id, 1, '');
  res.json({ token: sign({ id: info.lastInsertRowid, role: 'student' }), student: { name, email } });
});

// POST /api/auth/login
router.post('/auth/login', (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const s = db.prepare('SELECT * FROM students WHERE email = ?').get(email);
  if (!s || !bcrypt.compareSync(String(req.body.password || ''), s.password))
    return res.status(401).json({ error: 'Email or password is incorrect' });
  res.json({ token: sign({ id: s.id, role: 'student' }), student: { name: s.name, email: s.email } });
});

// POST /api/admin/login
router.post('/admin/login', (req, res) => {
  const a = db.prepare('SELECT * FROM admins WHERE email = ?').get(clean(req.body.email).toLowerCase());
  if (!a || !bcrypt.compareSync(String(req.body.password || ''), a.password))
    return res.status(401).json({ error: 'Email or password is incorrect' });
  res.json({ token: sign({ id: a.id, role: 'admin' }) });
});

module.exports = router;
