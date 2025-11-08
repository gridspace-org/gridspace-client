const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const TEST_TIMEOUT = 60000; // allow time for in-memory MongoDB binary downloads on first run

if (typeof jest !== 'undefined' && typeof jest.setTimeout === 'function') {
  jest.setTimeout(TEST_TIMEOUT);
}

// Ensure critical environment variables exist for authenticated route tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'UnitTestSecret#2025!Hardening';
process.env.ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
process.env.REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d';
process.env.API_URL = process.env.API_URL || 'http://localhost:5000';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = undefined;
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});