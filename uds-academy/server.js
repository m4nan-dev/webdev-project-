// server.js - starts the website at http://localhost:3000
const express = require('express');
const cors = require('cors');
const path = require('path');
const seedIfEmpty = require('./seed');

seedIfEmpty();                                   // fills the database on first run

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', require('./routes/public'));
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/student'));
app.use('/api/admin', require('./routes/admin'));

// Unknown API paths return JSON instead of an HTML page
app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));

// Serve the website and uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Last-resort error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
