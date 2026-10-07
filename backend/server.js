const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: 'All fields are required.',
    });
  }

  if (!['attendee', 'host'].includes(role)) {
    return res.status(400).json({
      message: 'Invalid role.',
    });
  }

  try {
    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `);

    insertUser.run(name.trim(), email.trim(), passwordHash, role);

    res.status(201).json({
      message: 'Account created successfully.',
    });
  } catch (error) {
    console.error('Signup error:', error);

    res.status(500).json({
      message: 'Unable to create account.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});