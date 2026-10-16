const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../server');
const db = require('../db');
const { uniqueEmail, createUser, createUserAndLogin } = require('./helpers');

const SECRET = process.env.JWT_SECRET;

describe('EMS-FR-02 Signup', () => {
  test('creates an attendee and a host account (201)', async () => {
    for (const role of ['attendee', 'host']) {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'New User', email: uniqueEmail(role), password: 'Password123', role });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Account created successfully.');
    }
  });

  test('stores a salted bcrypt hash and never the plaintext (EMS-SEC-01)', async () => {
    const email = uniqueEmail('hash');
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Hash User', email, password: 'Password123', role: 'host' })
      .expect(201);

    const row = db.prepare('SELECT password_hash FROM users WHERE email = ?').get(email);

    expect(row.password_hash).toMatch(/^\$2[aby]\$10\$/);
    expect(row.password_hash).toHaveLength(60);
    expect(row.password_hash).not.toContain('Password123');
  });

  test('same password produces different hashes (salting)', async () => {
    const a = await createUser(app, { role: 'host' });
    const b = await createUser(app, { role: 'host' });

    const hashA = db.prepare('SELECT password_hash h FROM users WHERE email = ?').get(a.email).h;
    const hashB = db.prepare('SELECT password_hash h FROM users WHERE email = ?').get(b.email).h;

    expect(hashA).not.toBe(hashB);
  });

  test('rejects a duplicate email, ignoring case and spaces (409)', async () => {
    const user = await createUser(app, { role: 'attendee' });

    for (const email of [user.email, user.email.toUpperCase(), `  ${user.email}  `]) {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Dup', email, password: 'Password123', role: 'host' });

      expect(response.status).toBe(409);
    }
  });

  test.each([
    ['missing password', { name: 'X', email: 'x@test.com', role: 'host' }],
    ['invalid role', { name: 'X', email: 'x@test.com', password: 'Password123', role: 'admin' }],
    ['numeric name', { name: 123, email: 'x@test.com', password: 'Password123', role: 'host' }],
    ['array email', { name: 'X', email: ['x@test.com'], password: 'Password123', role: 'host' }],
    ['blank name', { name: '   ', email: 'x@test.com', password: 'Password123', role: 'host' }],
  ])('rejects bad input: %s (400)', async (_label, body) => {
    const response = await request(app).post('/api/auth/signup').send(body);

    expect(response.status).toBe(400);
  });

  test('stores injection-style text literally and keeps the table intact', async () => {
    const email = uniqueEmail('sqli');
    await request(app)
      .post('/api/auth/signup')
      .send({ name: "Robert'); DROP TABLE users;--", email, password: 'Password123', role: 'host' })
      .expect(201);

    const row = db.prepare('SELECT name FROM users WHERE email = ?').get(email);
    expect(row.name).toBe("Robert'); DROP TABLE users;--");
  });
});

describe('EMS-FR-03 Login', () => {
  let attendee;
  let host;

  beforeAll(async () => {
    attendee = await createUser(app, { role: 'attendee', name: 'Attendee T' });
    host = await createUser(app, { role: 'host', name: 'Host T' });
  });

  test('returns a token and user for correct credentials', async () => {
    const response = await request(app).post('/api/auth/login').send(attendee);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(typeof response.body.token).toBe('string');
    expect(response.body.user).toEqual({
      id: expect.any(Number),
      name: 'Attendee T',
      email: attendee.email.toLowerCase(),
      role: 'attendee',
    });
    expect(JSON.stringify(response.body)).not.toMatch(/password/i);
  });

  test('JWT holds user id and role, uses HS256 and expires in 60 minutes', async () => {
    const response = await request(app).post('/api/auth/login').send(host);
    const decoded = jwt.decode(response.body.token, { complete: true });

    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.payload.id).toBe(response.body.user.id);
    expect(decoded.payload.role).toBe('host');
    expect(decoded.payload.exp - decoded.payload.iat).toBe(3600);
    expect(decoded.payload.email).toBeUndefined();
    expect(() => jwt.verify(response.body.token, SECRET)).not.toThrow();
    expect(() => jwt.verify(response.body.token, 'wrong-secret')).toThrow();
  });

  test('accepts the email in a different case and with spaces', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ ...attendee, email: `  ${attendee.email.toUpperCase()} ` });

    expect(response.status).toBe(200);
  });

  test('wrong password gives 401 and no token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ ...attendee, password: 'Wrong1234' });

    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });

  test('passwords are case-sensitive', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ ...attendee, password: 'password123' });

    expect(response.status).toBe(401);
  });

  test('unknown email gets the same 401 message as a wrong password', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ ...attendee, password: 'Wrong1234' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ role: 'attendee', email: 'nobody@test.com', password: 'Password123' });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
  });

  test('correct credentials with the wrong role are refused (403) with no token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ ...attendee, role: 'host' });

    expect(response.status).toBe(403);
    expect(response.body.token).toBeUndefined();
  });

  test.each([
    ['no role', { email: 'a@test.com', password: 'Password123' }],
    ['invalid role', { role: 'admin', email: 'a@test.com', password: 'Password123' }],
    ['no password', { role: 'host', email: 'a@test.com' }],
    ['array email', { role: 'host', email: ['a@test.com'], password: 'Password123' }],
    ['numeric password', { role: 'host', email: 'a@test.com', password: 12345 }],
    ['empty body', {}],
  ])('rejects bad input: %s (400)', async (_label, body) => {
    const response = await request(app).post('/api/auth/login').send(body);

    expect(response.status).toBe(400);
    expect(response.body.token).toBeUndefined();
  });

  test.each(["' OR '1'='1' --", "admin'--"])('SQL injection email %s gives 401', async (email) => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ role: 'attendee', email, password: 'x' });

    expect(response.status).toBe(401);
  });

  test('malformed JSON gives 400 and the server keeps working', async () => {
    const bad = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"role":');

    expect(bad.status).toBe(400);

    const good = await request(app).post('/api/auth/login').send(attendee);
    expect(good.status).toBe(200);
  });
});

describe('EMS-FR-04 / EMS-SEC-02 / EMS-SEC-03 Protected dashboards', () => {
  let attendee;
  let host;

  beforeAll(async () => {
    attendee = await createUserAndLogin(app, { role: 'attendee' });
    host = await createUserAndLogin(app, { role: 'host' });
  });

  test('each role reaches its own dashboard (200)', async () => {
    await request(app)
      .get('/api/host/dashboard')
      .set('Authorization', `Bearer ${host.token}`)
      .expect(200);
    await request(app)
      .get('/api/attendee/dashboard')
      .set('Authorization', `Bearer ${attendee.token}`)
      .expect(200);
  });

  test('a role cannot reach the other role dashboard (403)', async () => {
    await request(app)
      .get('/api/host/dashboard')
      .set('Authorization', `Bearer ${attendee.token}`)
      .expect(403);
    await request(app)
      .get('/api/attendee/dashboard')
      .set('Authorization', `Bearer ${host.token}`)
      .expect(403);
  });

  test('missing, malformed, tampered, expired and wrongly signed tokens give 401', async () => {
    const expired = jwt.sign({ id: host.id, role: 'host' }, SECRET, { expiresIn: -10 });
    const wrongSecret = jwt.sign({ id: host.id, role: 'host' }, 'other-secret');
    const tampered = `${host.token.slice(0, -3)}abc`;
    const unsigned = [
      Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url'),
      Buffer.from(JSON.stringify({ id: host.id, role: 'host' })).toString('base64url'),
      '',
    ].join('.');

    const headers = [
      undefined,
      'Bearer',
      'Bearer abc',
      `Token ${host.token}`,
      `Bearer ${expired}`,
      `Bearer ${wrongSecret}`,
      `Bearer ${tampered}`,
      `Bearer ${unsigned}`,
    ];

    for (const header of headers) {
      const req = request(app).get('/api/host/dashboard');
      if (header) req.set('Authorization', header);

      const response = await req;
      expect(response.status).toBe(401);
    }
  });
});