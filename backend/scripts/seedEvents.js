const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const db = require('../db');
const Event = require('../models/Event');

const DAY_MS = 24 * 60 * 60 * 1000;
const VENUES = [
  'Bengaluru International Centre',
  'Palace Grounds, Bengaluru',
  'Lalbagh Botanical Garden',
  'UB City Convention Hall',
  'Cubbon Park Amphitheatre',
];

function findHost(email) {
  const user = db
    .prepare('SELECT id, role FROM users WHERE LOWER(email) = ?')
    .get(email.trim().toLowerCase());

  if (!user) throw new Error(`No account found for ${email}. Sign up first.`);
  if (user.role !== 'host') throw new Error(`${email} is not a host account.`);

  return user;
}

function buildEvents(hostId, label, upcomingCount, pastCount) {
  const now = Date.now();
  const events = [];

  for (let i = 1; i <= upcomingCount; i += 1) {
    events.push({
      hostId,
      title: `${label} Upcoming ${String(i).padStart(2, '0')}`,
      venue: VENUES[i % VENUES.length],
      date: new Date(now + i * DAY_MS),
    });
  }

  for (let i = 1; i <= pastCount; i += 1) {
    events.push({
      hostId,
      title: `${label} Past ${String(i).padStart(2, '0')}`,
      venue: VENUES[i % VENUES.length],
      date: new Date(now - i * DAY_MS),
    });
  }

  return events;
}

async function main() {
  const [mainEmail, otherEmail] = process.argv.slice(2);

  if (!mainEmail) {
    console.error('Usage: node scripts/seedEvents.js <host-email> [other-host-email]');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in backend/.env.');
  }

  const mainHost = findHost(mainEmail);
  const otherHost = otherEmail ? findHost(otherEmail) : null;

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

  const hostIds = [mainHost.id, ...(otherHost ? [otherHost.id] : [])];
  const removed = await Event.deleteMany({ hostId: { $in: hostIds } });

  const events = buildEvents(mainHost.id, 'Main Host', 14, 9);
  if (otherHost) events.push(...buildEvents(otherHost.id, 'Other Host', 2, 1));

  await Event.insertMany(events);

  console.log(`Removed ${removed.deletedCount} old event(s) for the seeded host(s).`);
  console.log(`${mainEmail}: 14 upcoming, 9 past.`);
  if (otherHost) console.log(`${otherEmail}: 2 upcoming, 1 past.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());