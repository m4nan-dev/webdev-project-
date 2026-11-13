// db.js - opens the SQLite database and creates every table (safe to run many times)
const Database = require('better-sqlite3');
const path = require("path");
const dbPath = process.env.DB_PATH || path.join(__dirname, "database.db");
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  overview TEXT, hod_name TEXT, hod_message TEXT, labs TEXT, research_areas TEXT);
CREATE TABLE IF NOT EXISTS faculty (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, designation TEXT, qualification TEXT,
  email TEXT, photo TEXT, department_id INTEGER REFERENCES departments(id));
CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, level TEXT, duration TEXT, seats INTEGER, eligibility TEXT);
CREATE TABLE IF NOT EXISTS curriculum (
  id INTEGER PRIMARY KEY AUTOINCREMENT, department_id INTEGER REFERENCES departments(id),
  semester INTEGER, subject_code TEXT, subject_name TEXT, credits INTEGER);
CREATE TABLE IF NOT EXISTS calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, title TEXT NOT NULL, type TEXT);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT, type TEXT DEFAULT 'announcement', date TEXT);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, date TEXT, location TEXT, image TEXT);
CREATE TABLE IF NOT EXISTS event_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER REFERENCES events(id), name TEXT, email TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT, department_id INTEGER, semester INTEGER, phone TEXT);
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER REFERENCES students(id), semester INTEGER, subject TEXT, marks INTEGER, credits INTEGER);
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER REFERENCES students(id), subject TEXT, attended INTEGER, total INTEGER);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, dob TEXT, phone TEXT, email TEXT, marks_10 REAL, marks_12 REAL,
  program TEXT, document TEXT, status TEXT DEFAULT 'Pending', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, subject TEXT, message TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS alumni (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, batch INTEGER, company TEXT, role TEXT, testimonial TEXT);
CREATE TABLE IF NOT EXISTS clubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, category TEXT);
CREATE TABLE IF NOT EXISTS club_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT, club_id INTEGER REFERENCES clubs(id), student_id INTEGER REFERENCES students(id));
CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, image TEXT);
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT);
`);

module.exports = db;
