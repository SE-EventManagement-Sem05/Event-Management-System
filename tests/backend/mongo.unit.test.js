jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

jest.mock('../../../backend/config', () => ({
  MONGODB_URI: 'mongodb://127.0.0.1:27017/ems_test',
}));

const mongoose = require('mongoose');
const config = require('../../../backend/config');
const connectMongo = require('../../../backend/mongo');

let timeoutSpy;
let errorSpy;
let logSpy;

beforeEach(() => {
  jest.clearAllMocks();
  config.MONGODB_URI = 'mongodb://127.0.0.1:27017/ems_test';
  timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => ({}));
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  timeoutSpy.mockRestore();
  errorSpy.mockRestore();
  logSpy.mockRestore();
});

describe('MongoDB connection configuration', () => {
  test('does not attempt a connection when the URI is missing', async () => {
    config.MONGODB_URI = undefined;

    await connectMongo();

    expect(mongoose.connect).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      'MONGODB_URI is not set. Add it to backend/.env and restart.'
    );
    expect(timeoutSpy).not.toHaveBeenCalled();
  });

  test('connects using the configured URI and server selection timeout', async () => {
    mongoose.connect.mockResolvedValueOnce(undefined);

    await connectMongo();

    expect(mongoose.connect).toHaveBeenCalledWith(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    expect(logSpy).toHaveBeenCalledWith('MongoDB connected');
    expect(timeoutSpy).not.toHaveBeenCalled();
  });

  test('schedules the first retry after a failed connection', async () => {
    mongoose.connect.mockRejectedValueOnce(new Error('connection refused'));

    await connectMongo();

    expect(errorSpy).toHaveBeenCalledWith(
      'MongoDB connection failed (attempt 1): connection refused. Retrying in 2s.'
    );
    expect(timeoutSpy).toHaveBeenCalledTimes(1);
    expect(timeoutSpy.mock.calls[0][1]).toBe(2000);
    expect(typeof timeoutSpy.mock.calls[0][0]).toBe('function');
  });

  test('caps the retry delay at 30 seconds', async () => {
    mongoose.connect.mockRejectedValueOnce(new Error('connection refused'));

    await connectMongo(5);

    expect(timeoutSpy).toHaveBeenCalledTimes(1);
    expect(timeoutSpy.mock.calls[0][1]).toBe(30000);
  });
});
