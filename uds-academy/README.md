# UD'S Academy college website

Frontend: plain HTML, CSS, JavaScript. Backend: Node.js, Express, SQLite.

## Run it
1. Install Node.js (LTS) from nodejs.org.
2. In this folder run:  npm install
3. Then run:           npm start
4. Open http://localhost:3000

The database (database.db) is created and filled with sample data on the first start.
To reset all data: stop the server, delete database.db, start again.

## Demo logins
- Student: student1@udsacademy.com / pass123 (also student2, student3)
- Admin:   http://localhost:3000/admin/admin.html  with  admin@udsacademy.com / admin123

## Folders
- server.js, db.js, seed.js      server, tables, sample data
- routes/                        public.js, auth.js, student.js, admin.js (the API)
- middleware/auth.js             login tokens (JWT)
- public/                        the website (index.html, pages/, css/, js/, admin/)
- uploads/applications/          documents uploaded with applications
- uploads/syllabus/              put syllabus PDFs here, named cse-sem1.pdf, ece-sem3.pdf, ai-sem8.pdf ...

## Change these before you share it
- Set a secret:  JWT_SECRET=your-long-random-text npm start
- Change the admin password in seed.js, then reset the database.
- Replace placeholder images, phone numbers, and address (public/js/components.js, index.html, contact.html).
- Add a YouTube video ID in public/js/gallery.js.

## API
Public: GET /api/announcements, events, events/:id, faculty, departments, departments/:slug, programs, curriculum, calendar, gallery, placements/stats, alumni, clubs
        POST /api/apply, contact, alumni, events/:id/register
Student (login): POST /api/auth/signup, auth/login; GET/PUT /api/student/me; PUT /api/student/password; GET /api/student/attendance, results; POST /api/clubs/:id/join
Admin (login):   POST /api/admin/login; GET /api/admin/stats, applications, contacts, registrations, students; CRUD announcements, events; PUT applications/:id/status, results/:studentId, attendance/:studentId
