require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '60m';

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set. Add it to backend/.env and restart.');
  process.exit(1);
}

// Used so a missing account takes as long to reject as a wrong password.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

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

app.post('/api/auth/login', async (req, res) => {
  const { role, email, password } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password ||
    !['attendee', 'host'].includes(role)
  ) {
    return res.status(400).json({
      message: 'Role, email and password are required.',
    });
  }

  try {
    const user = db
      .prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?')
      .get(email.trim());

    const passwordMatches = await bcrypt.compare(
      password,
      user ? user.password_hash : DUMMY_HASH
    );

    if (!user || !passwordMatches || user.role !== role) {
      return res.status(401).json({
        message: 'Invalid email, password or role.',
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);

    res.status(500).json({
      message: 'Unable to log in. Please try again.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});