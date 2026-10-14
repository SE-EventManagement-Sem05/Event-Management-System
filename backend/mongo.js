const mongoose = require('mongoose');

const MAX_DELAY_MS = 30000;

async function connectMongo(attempt = 1) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to backend/.env and restart.');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (error) {
    const delay = Math.min(1000 * 2 ** attempt, MAX_DELAY_MS);

    console.error(
      `MongoDB connection failed (attempt ${attempt}): ${error.message}. Retrying in ${delay / 1000}s.`
    );

    setTimeout(() => connectMongo(attempt + 1), delay);
  }
}

module.exports = connectMongo;