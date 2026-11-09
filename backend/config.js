const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = Object.freeze({
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  SQLITE_PATH: process.env.SQLITE_PATH || path.join(__dirname, 'database', 'auth.sqlite'),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '60m',
});

