const request = require('supertest');

let counter = 0;

function uniqueEmail(prefix) {
  counter += 1;
  return `${prefix}${counter}-${Date.now()}@test.com`;
}

async function createUser(app, { role, name = 'Test User', password = 'Password123' }) {
  const email = uniqueEmail(role);

  await request(app)
    .post('/api/auth/signup')
    .send({ name, email, password, role })
    .expect(201);

  return { email, password, role, name };
}

async function login(app, { email, password, role }) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password, role })
    .expect(200);

  return response.body;
}

async function createUserAndLogin(app, options) {
  const user = await createUser(app, options);
  const body = await login(app, user);

  return { ...user, token: body.token, id: body.user.id };
}

module.exports = { uniqueEmail, createUser, login, createUserAndLogin };