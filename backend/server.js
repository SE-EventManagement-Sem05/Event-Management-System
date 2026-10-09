
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// -------------------- SIGNUP --------------------

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
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = db
      .prepare('SELECT id FROM users WHERE LOWER(email) = ?')
      .get(normalizedEmail);

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

    insertUser.run(
      name.trim(),
      normalizedEmail,
      passwordHash,
      role
    );

    return res.status(201).json({
      message: 'Account created successfully.',
    });
  } catch (error) {
    console.error('Signup error:', error);

    return res.status(500).json({
      message: 'Unable to create account.',
    });
  }
});

// -------------------- LOGIN --------------------

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      message: 'Email, password, and role are required.',
    });
  }

  if (!['attendee', 'host'].includes(role)) {
    return res.status(400).json({
      message: 'Invalid role.',
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const user = db
      .prepare('SELECT * FROM users WHERE LOWER(email) = ?')
      .get(normalizedEmail);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: 'This account does not belong to the selected role.',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Unable to log in.',
    });
  }
});

// -------------------- JWT AUTHENTICATION --------------------

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.',
    });
  }
}

// -------------------- ROLE AUTHORIZATION --------------------

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        message: 'You are not authorized to access this page.',
      });
    }

    next();
  };
}

// -------------------- PROTECTED DASHBOARD APIs --------------------

app.get(
  '/api/host/dashboard',
  authenticateToken,
  requireRole('host'),
  (req, res) => {
    res.json({
      message: 'Welcome to the Host dashboard.',
    });
  }
);

app.get(
  '/api/attendee/dashboard',
  authenticateToken,
  requireRole('attendee'),
  (req, res) => {
    res.json({
      message: 'Welcome to the Attendee dashboard.',
    });
  }
);

// -------------------- START SERVER --------------------

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
