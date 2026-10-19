const request = require('supertest');
const app = require('../server');

describe('API error responses', () => {
  test('unknown API route returns structured JSON 404', async () => {
    const response = await request(app)
      .get('/api/does-not-exist')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toMatchObject({
      status: 'error',
      code: 'ROUTE_NOT_FOUND',
      message: expect.any(String),
    });

    expect(response.body.message).not.toMatch(/at .*:\d+:\d+/);
  });

  test('missing authentication returns a readable JSON 401', async () => {
    const response = await request(app)
      .get('/api/host/dashboard')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body.message).toBe('Authentication required.');
    expect(JSON.stringify(response.body)).not.toMatch(/stack|SyntaxError/);
  });

  test('invalid token returns a readable JSON 401', async () => {
    const response = await request(app)
      .get('/api/host/dashboard')
      .set('Authorization', 'Bearer invalid-token')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body.message).toBe('Invalid or expired token.');
  });

  test('wrong role returns a readable JSON 403 without logging out', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: 1, userId: 1, role: 'attendee' },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '5m' }
    );

    const response = await request(app)
      .get('/api/host/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(403);

    expect(response.body.message).toBe(
      'You are not authorized to access this resource.'
    );
  });
});