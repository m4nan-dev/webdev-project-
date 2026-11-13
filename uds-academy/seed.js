// seed.js - fills the database with dummy data the FIRST time the server starts.
const db = require('./db');

function seedIfEmpty() {
  if (db.prepare('SELECT COUNT(*) AS n FROM departments').get().n > 0) return;

  const photo = name => 'https://placehold.co/200x200/18427C/F2B632?text=' +
    encodeURIComponent(name.split(' ').filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2));

  // ----- Departments -----
  const depts = [
    { name: 'Computer Science and Engineering', slug: 'cse', hod: 'Dr. Rohan Deshmukh',
      overview: 'The CSE department teaches programming, algorithms, systems, and software engineering through weekly lab work and a project in every semester.',
      msg: 'Our students write code from the first week. By final year they ship software that real users depend on.',
      labs: ['Programming Lab', 'Data Structures Lab', 'Networks Lab', 'Software Engineering Studio'],
      research: ['Distributed systems', 'Cybersecurity', 'Software testing', 'Cloud computing'] },
    { name: 'Electronics and Communication Engineering', slug: 'ece', hod: 'Dr. Sunita Rao',
      overview: 'ECE covers circuits, signals, embedded systems, and wireless communication, with a strong hands-on hardware focus.',
      msg: 'We want students who can read a datasheet, solder a board, and debug a signal with equal confidence.',
      labs: ['Analog Circuits Lab', 'Digital Electronics Lab', 'Embedded Systems Lab', 'Communication Lab'],
      research: ['Internet of Things', 'Wireless sensor networks', 'VLSI design', 'Signal processing'] },
    { name: 'Artificial Intelligence and Data Science', slug: 'ai', hod: 'Dr. Vikram Nair',
      overview: 'This department trains students in machine learning, statistics, and data engineering, using real datasets from industry partners.',
      msg: 'Good models start with good questions. We teach students to ask both well and honestly.',
      labs: ['Machine Learning Lab', 'Data Analytics Lab', 'Computer Vision Lab', 'Big Data Lab'],
      research: ['Deep learning', 'Natural language processing', 'Computer vision', 'Responsible AI'] }
  ];
  const addDept = db.prepare(`INSERT INTO departments (name, slug, overview, hod_name, hod_message, labs, research_areas)
                              VALUES (?,?,?,?,?,?,?)`);
  depts.forEach(d => addDept.run(d.name, d.slug, d.overview, d.hod, d.msg, JSON.stringify(d.labs), JSON.stringify(d.research)));

  // ----- Faculty: 5 per department (15 total) -----
  const people = [
    ['Dr. Rohan Deshmukh', 'Professor and HOD', 'Ph.D. Computer Science'], ['Dr. Meera Joshi', 'Professor', 'Ph.D. Software Engineering'],
    ['Prof. Amit Chauhan', 'Associate Professor', 'M.Tech Computer Science'], ['Prof. Kavya Menon', 'Assistant Professor', 'M.Tech Information Security'],
    ['Mr. Sandeep Patil', 'Assistant Professor', 'M.Tech Cloud Computing'],
    ['Dr. Sunita Rao', 'Professor and HOD', 'Ph.D. Electronics'], ['Dr. Anil Kapoor', 'Professor', 'Ph.D. VLSI Design'],
    ['Prof. Nisha Bansal', 'Associate Professor', 'M.Tech Communication Systems'], ['Prof. Rahul Saxena', 'Assistant Professor', 'M.Tech Embedded Systems'],
    ['Ms. Divya Pillai', 'Assistant Professor', 'M.Tech Signal Processing'],
    ['Dr. Vikram Nair', 'Professor and HOD', 'Ph.D. Machine Learning'], ['Dr. Anjali Gupta', 'Professor', 'Ph.D. Data Science'],
    ['Prof. Karan Malhotra', 'Associate Professor', 'M.Tech Artificial Intelligence'], ['Prof. Ritu Agarwal', 'Assistant Professor', 'M.Tech Data Analytics'],
    ['Mr. Harsh Vora', 'Assistant Professor', 'M.Tech Computer Vision']
  ];
  const addFac = db.prepare(`INSERT INTO faculty (name, designation, qualification, email, photo, department_id) VALUES (?,?,?,?,?,?)`);
  people.forEach((p, i) => {
    const email = p[0].replace(/^(Dr|Prof|Mr|Ms)\.\s*/, '').toLowerCase().replace(/\s+/g, '.') + '@udsacademy.com';
    addFac.run(p[0], p[1], p[2], email, photo(p[0]), Math.floor(i / 5) + 1);
  });

  // ----- Programs -----
  const addProg = db.prepare('INSERT INTO programs (name, level, duration, seats, eligibility) VALUES (?,?,?,?,?)');
  [['B.Tech Computer Science and Engineering', 'Undergraduate', '4 years', 120, '12th with Physics, Chemistry, Maths; 60% minimum'],
   ['B.Tech Electronics and Communication', 'Undergraduate', '4 years', 90, '12th with Physics, Chemistry, Maths; 60% minimum'],
   ['B.Tech AI and Data Science', 'Undergraduate', '4 years', 60, '12th with Physics, Chemistry, Maths; 60% minimum'],
   ['M.Tech Computer Science', 'Postgraduate', '2 years', 30, 'B.Tech in CSE or IT; 55% minimum'],
   ['M.Tech VLSI and Embedded Systems', 'Postgraduate', '2 years', 24, 'B.Tech in ECE or EEE; 55% minimum'],
   ['M.Tech Data Science', 'Postgraduate', '2 years', 24, 'B.Tech in any branch; 55% minimum']]
   .forEach(p => addProg.run(...p));

  // ----- Curriculum: 8 semesters x 3 subjects per department -----
  const subjects = ['Core Theory', 'Core Lab', 'Elective'];
  const addCur = db.prepare('INSERT INTO curriculum (department_id, semester, subject_code, subject_name, credits) VALUES (?,?,?,?,?)');
  [1, 2, 3].forEach(dep => {
    for (let sem = 1; sem <= 8; sem++) {
      subjects.forEach((s, i) => addCur.run(dep, sem, `D${dep}S${sem}0${i + 1}`, `${s} ${sem}`, i === 1 ? 2 : 4));
    }
  });

  // ----- Academic calendar -----
  const addCal = db.prepare('INSERT INTO calendar (date, title, type) VALUES (?,?,?)');
  [['2026-07-20', 'Odd semester classes begin', 'Class'], ['2026-08-15', 'Independence Day', 'Holiday'],
   ['2026-09-14', 'Mid-semester exams begin', 'Exam'], ['2026-09-26', 'Mid-semester exams end', 'Exam'],
   ['2026-10-02', 'Gandhi Jayanti', 'Holiday'], ['2026-10-20', 'Dussehra break', 'Holiday'],
   ['2026-11-12', 'Annual tech fest', 'Event'], ['2026-11-30', 'Last day of classes', 'Class'],
   ['2026-12-05', 'End-semester exams begin', 'Exam'], ['2026-12-22', 'End-semester exams end', 'Exam'],
   ['2027-01-10', 'Even semester classes begin', 'Class'], ['2027-01-26', 'Republic Day', 'Holiday']]
   .forEach(c => addCal.run(...c));

  // ----- Announcements (6 general + 4 student news) -----
  const addAnn = db.prepare('INSERT INTO announcements (title, body, type, date) VALUES (?,?,?,?)');
  [['Admissions open for 2026-27', 'Applications for all B.Tech and M.Tech programs are now open.', 'announcement', '2026-06-01'],
   ['Mid-semester exam timetable released', 'The timetable is available on the Academic Calendar page.', 'announcement', '2026-08-28'],
   ['Scholarship applications due 30 September', 'Merit and need-based scholarship forms close on 30 September.', 'announcement', '2026-09-01'],
   ['Library timings extended during exams', 'The library stays open until 10 PM from 14 September.', 'announcement', '2026-09-10'],
   ['Guest lecture on cloud security', 'An industry speaker visits the CSE department on 3 October.', 'announcement', '2026-09-25'],
   ['Campus Wi-Fi maintenance on Sunday', 'Wi-Fi will be unavailable from 8 AM to 12 PM.', 'announcement', '2026-10-15'],
   ['Our team wins state hackathon', 'A team of four third-year students won first place.', 'student', '2026-08-05'],
   ['Robotics club opens recruitment', 'First and second-year students can apply until 20 August.', 'student', '2026-08-12'],
   ['Sports day winners announced', 'The ECE department won the overall trophy.', 'student', '2026-09-20'],
   ['Placement: 12 offers at one company', 'A top software firm made 12 offers in a single drive.', 'student', '2026-10-08']]
   .forEach(a => addAnn.run(...a));

  // ----- Events -----
  const addEv = db.prepare('INSERT INTO events (title, description, date, location, image) VALUES (?,?,?,?,?)');
  const img = t => 'https://placehold.co/600x360/18427C/F2B632?text=' + encodeURIComponent(t);
  [['Annual Tech Fest', 'Two days of coding contests, robotics, and project demos.', '2026-11-12', 'Main Auditorium'],
   ['Alumni Meet', 'Alumni return to campus to share career advice.', '2026-12-14', 'Seminar Hall'],
   ['Women in Tech Day', 'Talks and workshops led by women engineers.', '2027-03-08', 'Auditorium'],
   ['Hackathon 24', 'A 24-hour build contest open to all departments.', '2026-11-20', 'Computer Lab Block'],
   ['Sports Day', 'Track, field, and team events across departments.', '2026-09-18', 'College Ground'],
   ['Freshers Welcome', 'A welcome event for the new first-year batch.', '2026-08-01', 'Auditorium'],
   ['Science Exhibition', 'Student science and engineering models on display.', '2026-04-10', 'Exhibition Hall'],
   ['Convocation 2026', 'Degree ceremony for the graduating batch.', '2026-06-25', 'Main Auditorium']]
   .forEach(e => addEv.run(e[0], e[1], e[2], e[3], img(e[0])));

  console.log('Database seeded with sample data.');
}

// Second seed: students, results, attendance, alumni, clubs, gallery, and the admin account
const bcrypt = require('bcryptjs');
function seedExtras() {
  if (db.prepare('SELECT COUNT(*) AS n FROM admins').get().n > 0) return;
  db.prepare('INSERT INTO admins (email, password) VALUES (?,?)').run('admin@udsacademy.com', bcrypt.hashSync('admin123', 10));

  const addStu = db.prepare('INSERT INTO students (name, email, password, department_id, semester, phone) VALUES (?,?,?,?,?,?)');
  const addRes = db.prepare('INSERT INTO results (student_id, semester, subject, marks, credits) VALUES (?,?,?,?,?)');
  const addAtt = db.prepare('INSERT INTO attendance (student_id, subject, attended, total) VALUES (?,?,?,?)');
  const sem1 = [['Mathematics', 4], ['Physics', 4], ['Programming', 4], ['Communication Skills', 2]];
  const sem2 = [['Data Structures', 4], ['Electronics', 4], ['Statistics', 4], ['Environmental Studies', 2]];
  const subs = ['Algorithms', 'Database Systems', 'Operating Systems', 'Networks', 'Software Engineering'];
  [['Aarav Sharma', 'student1@udsacademy.com'], ['Diya Patel', 'student2@udsacademy.com'], ['Rohan Iyer', 'student3@udsacademy.com']]
    .forEach((s, i) => {
      const id = addStu.run(s[0], s[1], bcrypt.hashSync('pass123', 10), i + 1, 3, '9876500' + (100 + i)).lastInsertRowid;
      [[1, sem1], [2, sem2]].forEach(([sem, list]) =>
        list.forEach((x, j) => addRes.run(id, sem, x[0], 58 + (i * 7 + sem * 5 + j * 9) % 38, x[1])));
      subs.forEach((sub, j) => addAtt.run(id, sub, 26 + (i * 5 + j * 4) % 14, 40));
    });

  const addAl = db.prepare('INSERT INTO alumni (name, batch, company, role, testimonial) VALUES (?,?,?,?,?)');
  [['Aditi Verma', 2024, 'Amazon', 'Software Engineer', 'The project work here prepared me for real teams.'],
   ['Kunal Shah', 2023, 'Zoho', 'Hardware Engineer', 'My embedded lab experience got me the job.'],
   ['Neha Reddy', 2024, 'Deloitte', 'Data Analyst', 'Faculty here made statistics make sense.'],
   ['Manish Joshi', 2022, 'Infosys', 'Systems Engineer', 'The placement cell trained us well.'],
   ['Pooja Nair', 2021, 'Accenture', 'Consultant', 'Clubs taught me to lead a team.'],
   ['Sahil Khanna', 2020, 'TCS', 'Developer', 'I still use what I learned in the labs.'],
   ['Ritika Das', 2019, 'Capgemini', 'Tech Lead', 'Great mentors and a supportive campus.'],
   ['Varun Bhatt', 2018, 'Wipro', 'Network Engineer', 'The ECE faculty pushed me to aim higher.'],
   ['Isha Kapoor', 2017, 'Google', 'Engineer', 'Hackathons here were my first big stage.'],
   ['Dev Malhotra', 2016, 'Cognizant', 'Project Manager', 'Learning to finish projects mattered most.']]
   .forEach(a => addAl.run(...a));

  const addCl = db.prepare('INSERT INTO clubs (name, description, category) VALUES (?,?,?)');
  [['Coding Club', 'Weekly contests and open-source projects.', 'Technical'],
   ['Robotics Club', 'Build and race autonomous robots.', 'Technical'],
   ['AI Society', 'Study groups and Kaggle teams.', 'Technical'],
   ['Drama Club', 'Stage plays and street theatre.', 'Cultural'],
   ['Music Society', 'Bands, choir, and open mic nights.', 'Cultural'],
   ['Photography Club', 'Photo walks and campus exhibitions.', 'Cultural'],
   ['Cricket Team', 'Inter-college tournaments all year.', 'Sports'],
   ['Football Team', 'Practice four evenings a week.', 'Sports']]
   .forEach(c => addCl.run(...c));

  const addG = db.prepare('INSERT INTO gallery (title, category, image) VALUES (?,?,?)');
  const cats = ['Fest', 'Sports', 'Campus', 'Convocation'];
  const colors = ['18427C', '102f59', '1d5aa5', '0e3a6b'];
  for (let i = 0; i < 12; i++) {
    const cat = cats[i % 4];
    addG.run(`${cat} photo ${Math.floor(i / 4) + 1}`, cat,
      `https://placehold.co/600x400/${colors[i % 4]}/F2B632?text=${cat}+${Math.floor(i / 4) + 1}`);
  }
}

module.exports = function () { seedIfEmpty(); seedExtras(); };
