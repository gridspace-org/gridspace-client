import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'TestJWTSecret#2025!MustBeStrongEnoughForTests';
process.env.ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
process.env.REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d';
process.env.API_URL = process.env.API_URL || 'http://localhost:5002';
process.env.PORT = process.env.PORT || '5002';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gridspace-test';

// Disable password complexity check in tests
process.env.DISABLE_PASSWORD_CHECK = 'true';

let mongoServer;

// Global test setup
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'gridspace-test',
      startupTimeout: 120000, // 2 minutes for CI environments
    },
  });

  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    // Suppress deprecation warnings in tests
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 120000); // 2 minute timeout for CI

// Clean up after all tests
afterAll(async () => {
  // Close mongoose connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  // Stop MongoDB memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

// Clean up collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Increase timeout for all tests (useful for CI)
