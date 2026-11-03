
// A small command-line helper that prepares and inspects the test database. It
// runs in plain Node (not inside Jest), the same way the real server runs.
//
// Usage: node tests/support/dbTool.js <command>   (JSON input on stdin)
//   reset                 clears the events and registrations of the test database
//   insertEvents          inserts events given as a JSON array, returns their ids
//   insertRawEvent        inserts one event document exactly as given (no schema rules)
//   insertRegistrations   adds registrations: [{ eventId, count, firstAttendeeId }]
//   getEvent              returns the stored event document for { id }
//   countEvents           counts events matching a filter object
//   countRegistrations    counts registrations for an event
const mongoose = require('mongoose');
const Event = require('../../models/Event');

async function readStdin() {
  let data = '';

  for await (const chunk of process.stdin) {
    data += chunk;
  }

  return data.trim() ? JSON.parse(data) : null;
}

async function run(command, payload) {
  switch (command) {
    case 'reset':
      await Event.deleteMany({});
      await mongoose.connection.collection('registrations').deleteMany({});
      return { ok: true };

    case 'insertEvents': {
      const events = payload.map((event) => ({
        ...event,
        date: new Date(event.date),
      }));
      const inserted = await Event.insertMany(events);

      return {
        inserted: inserted.length,
        ids: inserted.map((event) => String(event._id)),
      };
    }

    case 'insertRawEvent': {
      const result = await Event.collection.insertOne({
        ...payload,
        date: new Date(payload.date),
      });

      return { id: String(result.insertedId) };
    }

    case 'insertRegistrations': {
      const Registration = require('../../models/Registration');
      const registrations = [];

      for (const { eventId, count, firstAttendeeId } of payload) {
        for (let index = 0; index < count; index += 1) {
          registrations.push({
            eventId,
            attendeeId: firstAttendeeId + index,
          });
        }
      }

      if (registrations.length > 0) {
        await Registration.insertMany(registrations);
      }

      return { inserted: registrations.length };
    }

    case 'getEvent': {
      const event = await Event.collection.findOne({
        _id: new mongoose.Types.ObjectId(payload.id),
      });

      return { event };
    }

    case 'countEvents':
      return {
        count: await Event.collection.countDocuments(payload || {}),
      };

    case 'countRegistrations': {
      const Registration = require('../../models/Registration');

      return {
        count: await Registration.countDocuments({
          eventId: payload.eventId,
        }),
      };
    }

    default:
      throw new Error(`Unknown command "${command}".`);
  }
}

async function main() {
  const command = process.argv[2];
  const payload = await readStdin();

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });

  const databaseName = mongoose.connection.name;

  if (!databaseName.endsWith('_test')) {
    throw new Error(
      `Refusing to touch database "${databaseName}": only databases whose name ends in _test are allowed.`
    );
  }

  console.log(JSON.stringify(await run(command, payload)));
}

main()
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error.message);

    try {
      await mongoose.disconnect();
    } catch {
      // nothing to disconnect
    }

    process.exit(1);
  });
