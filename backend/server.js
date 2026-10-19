require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const connectMongo = require('./mongo');
const {
  listHostEvents,
  getHostEvent,
  createEvent,
  updateEvent,
} = require('./controllers/eventController');

const {
  getEventForReview,
  createReview,
} = require('./controllers/reviewController');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '60m';

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set. Add it to backend/.env and restart.');
  process.exit(1);
}

// Dummy hash to reduce timing differences for nonexistent accounts.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

app.use(cors());
app.use(express.json());

// -------------------- SIGNUP --------------------

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || !password ||
    !['attendee', 'host'].includes(role)
  ) {
    return res.status(400).json({
      message: 'Name, email, password, and a valid role are required.',
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

    db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run(name.trim(), normalizedEmail, passwordHash, role);

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
  const { role, email, password } = req.body || {};

  if (
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || !password ||
    !['attendee', 'host'].includes(role)
  ) {
    return res.status(400).json({
      message: 'Role, email, and password are required.',
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const user = db.prepare(`
      SELECT id, name, email, password_hash, role
      FROM users
      WHERE LOWER(email) = ?
    `).get(normalizedEmail);

    const passwordMatches = await bcrypt.compare(
      password,
      user ? user.password_hash : DUMMY_HASH
    );

    if (!user || !passwordMatches) {
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
      { id: user.id, userId: user.id, role: user.role },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    return res.status(200).json({
      status: 'success',
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
      message: 'Unable to log in. Please try again.',
    });
  }
});

// -------------------- JWT AUTHENTICATION --------------------

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader ? authHeader.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.',
    });
  }
}

// -------------------- ROLE AUTHORIZATION --------------------

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        message: 'You are not authorized to access this resource.',
      });
    }

    return next();
  };
}

// -------------------- EVENT REVIEWS (EMS-FR-12) --------------------

app.get(
  '/api/events/:id',
  authenticateToken,
  getEventForReview
);

app.post(
  '/api/events/:id/reviews',
  authenticateToken,
  requireRole('attendee'),
  createReview
);

// -------------------- PROTECTED DASHBOARD APIs --------------------

app.get(
  '/api/host/dashboard',
  authenticateToken,
  requireRole('host'),
  (req, res) => {
    return res.json({
      message: 'Welcome to the Host dashboard.',
    });
  }
);

app.get(
  '/api/attendee/dashboard',
  authenticateToken,
  requireRole('attendee'),
  (req, res) => {
    return res.json({
      message: 'Welcome to the Attendee dashboard.',
    });
  }
);

// -------------------- HOST EVENTS (EMS-FR-05) --------------------

app.get(
  '/api/host/events',
  authenticateToken,
  requireRole('host'),
  listHostEvents
);

app.get(
  '/api/host/events/:id',
  authenticateToken,
  requireRole('host'),
  getHostEvent
);

app.post(
  '/api/host/events',
  authenticateToken,
  requireRole('host'),
  createEvent
);

app.put(
  '/api/host/events/:id',
  authenticateToken,
  requireRole('host'),
  updateEvent
);

// -------------------- ERROR HANDLING --------------------

app.use((req, res) => {
  return res.status(404).json({
    status: 'error',
    code: 'ROUTE_NOT_FOUND',
    message: 'The requested page or resource could not be found.',
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // Handle body-parser JSON syntax error (malformed JSON -> 400)
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      status: 'error',
      code: 'BAD_REQUEST',
      message: 'Malformed JSON in request body.',
    });
  }

  // Handle request entity too large error (payload too large -> 413)
  if (error.status === 413 || error.type === 'entity.too.large') {
    return res.status(413).json({
      status: 'error',
      code: 'REQUEST_ENTITY_TOO_LARGE',
      message: 'Request entity too large.',
    });
  }

  console.error('Unhandled server error:', error.message);

  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong on our server. Please try again.',
  });
});

// -------------------- START SERVER --------------------

if (require.main === module) {
  connectMongo();

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

module.exports = app;