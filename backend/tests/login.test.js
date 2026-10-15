const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = require('../server');
const db = require('../db');
const { uniqueEmail, createUser } = require('./helpers');

const SECRET = process.env.JWT_SECRET;
const LOGIN = '/api/auth/login';

const REQUIRED_MESSAGE = 'Role, email, and password are required.';
const INVALID_MESSAGE = 'Invalid email or password.';
const WRONG_ROLE_MESSAGE = 'This account does not belong to the selected role.';

const post = (body) => request(app).post(LOGIN).send(body);

function insertUser({ name = 'Direct User', email = uniqueEmail('direct'), passwordHash, role = 'attendee' }) {
  db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
    name,
    email,
    passwordHash,
    role
  );

  return email;
}

// Loads a second copy of the server with different environment values.
// The copy has its own in-memory SQLite database.
function loadIsolatedApp(env) {
  const saved = {};
  let isolated;

  for (const [key, value] of Object.entries(env)) {
    saved[key] = process.env[key];
    process.env[key] = value;
  }

  try {
    jest.isolateModules(() => {
      isolated = require('../server');
    });
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  return isolated;
}

let attendee;
let host;

beforeAll(async () => {
  attendee = await createUser(app, { role: 'attendee', name: 'Attendee T' });
  host = await createUser(app, { role: 'host', name: 'Host T' });
});

describe('EMS-FR-03 successful login', () => {
  test.each([
    ['attendee', () => attendee, 'Attendee T'],
    ['host', () => host, 'Host T'],
  ])('a registered %s receives a token and their profile (200)', async (role, getUser, name) => {
    const user = getUser();
    const response = await post(user);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Login successful.');
    expect(response.body.token.split('.')).toHaveLength(3);
    expect(response.body.user).toEqual({
      id: expect.any(Number),
      name,
      email: user.email.toLowerCase(),
      role,
    });
  });

  test('the response holds only the documented fields and no secrets', async () => {
    const response = await post(attendee);

    expect(Object.keys(response.body).sort()).toEqual(['message', 'status', 'token', 'user']);
    expect(Object.keys(response.body.user).sort()).toEqual(['email', 'id', 'name', 'role']);
    expect(JSON.stringify(response.body)).not.toMatch(/password|\$2[aby]\$/i);
  });

  test('the user id in the response is the id stored in the database', async () => {
    const response = await post(host);
    const row = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(host.email.toLowerCase());

    expect(response.body.user.id).toBe(row.id);
  });

  test('the email is matched ignoring case and surrounding spaces', async () => {
    const response = await post({ ...attendee, email: `  ${attendee.email.toUpperCase()}  ` });

    expect(response.status).toBe(200);
  });

  test('login completes within 2 seconds (SRS performance)', async () => {
    const started = Date.now();

    await post(attendee).expect(200);

    expect(Date.now() - started).toBeLessThan(2000);
  });
});

describe('EMS-FR-03 JWT contents', () => {
  test('the token holds the user id and role, signed with HS256', async () => {
    const response = await post(host);
    const decoded = jwt.decode(response.body.token, { complete: true });

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.payload.id).toBe(response.body.user.id);
    expect(decoded.payload.role).toBe('host');
  });

  test('the token holds no personal or secret data', async () => {
    const response = await post(attendee);
    const { payload } = jwt.decode(response.body.token, { complete: true });

    for (const key of ['email', 'name', 'password', 'password_hash']) {
      expect(payload[key]).toBeUndefined();
    }
  });

  test('the signature verifies with the server secret and fails with any other', async () => {
    const response = await post(attendee);

    expect(() => jwt.verify(response.body.token, SECRET, { algorithms: ['HS256'] })).not.toThrow();
    expect(() => jwt.verify(response.body.token, 'wrong-secret')).toThrow();
  });

  test('the issued token is accepted by the protected API of its own role', async () => {
    const hostLogin = await post(host);
    const attendeeLogin = await post(attendee);

    await request(app)
      .get('/api/host/dashboard')
      .set('Authorization', `Bearer ${hostLogin.body.token}`)
      .expect(200);
    await request(app)
      .get('/api/attendee/dashboard')
      .set('Authorization', `Bearer ${attendeeLogin.body.token}`)
      .expect(200);
  });
});

describe('EMS-FR-03 token expiry is configured', () => {
  test('the token expires 60 minutes after it is issued', async () => {
    const response = await post(attendee);
    const { exp, iat } = jwt.decode(response.body.token);

    expect(exp - iat).toBe(3600);
  });

  test.each([
    ['2m', 120],
    ['15m', 900],
    ['2h', 7200],
  ])('JWT_EXPIRES_IN=%s gives a lifetime of %s seconds', async (expiresIn, seconds) => {
    const isolatedApp = loadIsolatedApp({ JWT_EXPIRES_IN: expiresIn });
    const user = await createUser(isolatedApp, { role: 'host' });

    const response = await request(isolatedApp).post(LOGIN).send(user).expect(200);
    const { exp, iat } = jwt.decode(response.body.token);

    expect(exp - iat).toBe(seconds);
  }, 30000);

  test('an expired token is rejected by the protected API', async () => {
    const expired = jwt.sign({ id: 1, role: 'host' }, SECRET, { expiresIn: -10 });

    await request(app)
      .get('/api/host/dashboard')
      .set('Authorization', `Bearer ${expired}`)
      .expect(401);
  });

  test('the server refuses to start without a JWT secret', () => {
    const originalSecret = process.env.JWT_SECRET;
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const logError = jest.spyOn(console, 'error').mockImplementation(() => {});

    delete process.env.JWT_SECRET;
    jest.doMock('dotenv', () => ({ config: () => ({}) }));

    try {
      jest.isolateModules(() => {
        expect(() => require('../server')).toThrow('process.exit called');
      });

      expect(exit).toHaveBeenCalledWith(1);
      expect(logError).toHaveBeenCalledWith(expect.stringContaining('JWT_SECRET'));
    } finally {
      jest.dontMock('dotenv');
      exit.mockRestore();
      logError.mockRestore();
      process.env.JWT_SECRET = originalSecret;
    }
  });
});

describe('EMS-FR-03 credentials are verified against hashed data', () => {
  test('the stored password is a bcrypt hash, not the plaintext', () => {
    const row = db
      .prepare('SELECT password_hash FROM users WHERE LOWER(email) = ?')
      .get(attendee.email.toLowerCase());

    expect(row.password_hash).toMatch(/^\$2[aby]\$10\$/);
    expect(row.password_hash).toHaveLength(60);
    expect(row.password_hash).not.toContain(attendee.password);
  });

  test('an account whose stored value is plaintext cannot log in', async () => {
    const email = insertUser({ passwordHash: 'Password123' });

    const response = await post({ role: 'attendee', email, password: 'Password123' });

    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });

  test('an account with a valid bcrypt hash can log in', async () => {
    const email = insertUser({ passwordHash: bcrypt.hashSync('Known#Pass1', 10), role: 'host' });

    const response = await post({ role: 'host', email, password: 'Known#Pass1' });

    expect(response.status).toBe(200);
  });

  test('the password is checked against whatever hash is stored', async () => {
    const email = insertUser({ passwordHash: bcrypt.hashSync('OldPass123', 10) });

    await post({ role: 'attendee', email, password: 'OldPass123' }).expect(200);

    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(
      bcrypt.hashSync('NewPass456', 10),
      email
    );

    await post({ role: 'attendee', email, password: 'OldPass123' }).expect(401);
    await post({ role: 'attendee', email, password: 'NewPass456' }).expect(200);
  });
});

describe('EMS-FR-03 invalid credentials give a clear error and no token', () => {
  test('a wrong password gives 401, a clear message and no token', async () => {
    const response = await post({ ...attendee, password: 'Wrong1234' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(INVALID_MESSAGE);
    expect(response.body.token).toBeUndefined();
    expect(Object.keys(response.body)).toEqual(['message']);
  });

  test('an unknown email gets exactly the same response as a wrong password', async () => {
    const wrongPassword = await post({ ...attendee, password: 'Wrong1234' });
    const unknownEmail = await post({ role: 'attendee', email: 'nobody@test.com', password: 'Password123' });

    expect(unknownEmail.status).toBe(wrongPassword.status);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  test('passwords are case-sensitive', async () => {
    await post({ ...attendee, password: attendee.password.toLowerCase() }).expect(401);
  });

  test('correct credentials with the wrong role give 403 and no token', async () => {
    const response = await post({ ...attendee, role: 'host' });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(WRONG_ROLE_MESSAGE);
    expect(response.body.token).toBeUndefined();
  });

  test('a wrong password with the wrong role is still a plain 401', async () => {
    const response = await post({ ...attendee, role: 'host', password: 'Wrong1234' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(INVALID_MESSAGE);
  });

  test.each(["' OR '1'='1' --", "admin'--", '" OR ""="'])('SQL text as the email (%s) gives 401', async (email) => {
    const response = await post({ role: 'attendee', email, password: 'x' });

    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });

  test('SQL text as the password gives 401', async () => {
    await post({ ...attendee, password: "' OR '1'='1" }).expect(401);
  });
});

describe('EMS-FR-03 request validation', () => {
  test.each([
    ['no role', { email: 'a@test.com', password: 'Password123' }],
    ['unknown role', { role: 'admin', email: 'a@test.com', password: 'Password123' }],
    ['role in capitals', { role: 'HOST', email: 'a@test.com', password: 'Password123' }],
    ['no email', { role: 'host', password: 'Password123' }],
    ['blank email', { role: 'host', email: '   ', password: 'Password123' }],
    ['email as a list', { role: 'host', email: ['a@test.com'], password: 'Password123' }],
    ['email as an operator object', { role: 'host', email: { $ne: null }, password: 'Password123' }],
    ['no password', { role: 'host', email: 'a@test.com' }],
    ['empty password', { role: 'host', email: 'a@test.com', password: '' }],
    ['numeric password', { role: 'host', email: 'a@test.com', password: 12345 }],
    ['empty object', {}],
  ])('%s gives 400 with no token', async (_label, body) => {
    const response = await post(body);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(REQUIRED_MESSAGE);
    expect(response.body.token).toBeUndefined();
  });

  test('a request without any body gives 400', async () => {
    const response = await request(app).post(LOGIN);

    expect(response.status).toBe(400);
    expect(response.body.token).toBeUndefined();
  });

  test('a form-encoded body gives 400 (only JSON is accepted)', async () => {
    const response = await request(app)
      .post(LOGIN)
      .type('form')
      .send(`role=attendee&email=${attendee.email}&password=${attendee.password}`);

    expect(response.status).toBe(400);
  });
});

describe('EMS-FR-03 HTTP behaviour', () => {
  test('malformed JSON gives 400 and the server keeps working', async () => {
    const bad = await request(app)
      .post(LOGIN)
      .set('Content-Type', 'application/json')
      .send('{"role":');

    expect(bad.status).toBe(400);
    expect(bad.body.token).toBeUndefined();

    await post(attendee).expect(200);
  });

  test('only POST is accepted', async () => {
    const response = await request(app).get(LOGIN);

    expect(response.status).toBe(404);
    expect(response.body.token).toBeUndefined();
  });

  test('an oversized request is refused with 413 and the server keeps working', async () => {
    const response = await post({ role: 'attendee', email: 'a@test.com', password: 'p'.repeat(200000) });

    expect(response.status).toBe(413);

    await post(attendee).expect(200);
  });
});

describe('EMS-FR-03 reliability', () => {
  test('20 simultaneous valid logins all succeed', async () => {
    const responses = await Promise.all(Array.from({ length: 20 }, () => post(attendee)));

    expect(responses.every((r) => r.status === 200 && r.body.token)).toBe(true);
  }, 30000);

  test('a burst of 40 wrong-password logins never breaks the server', async () => {
    const responses = await Promise.all(
      Array.from({ length: 40 }, () => post({ ...attendee, password: 'Wrong1234' }))
    );

    // 423 and 429 are allowed so this test stays valid once the login lockout (EMS-SEC-06) exists.
    expect(responses.every((r) => [401, 423, 429].includes(r.status))).toBe(true);
    expect(responses.some((r) => r.body.token)).toBe(false);

    await post(host).expect(200);
  }, 30000);
});