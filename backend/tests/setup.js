const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Runs once before any test file's tests execute.
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-not-for-production';

  mongod = await MongoMemoryServer.create({ instance: { replSet: 'rs0' } });
  const directUri = mongod.getUri();
  await mongoose.connect(directUri, { directConnection: true });
  const host = new URL(directUri).host;
  await mongoose.connection.db.admin().command({ replSetInitiate: { _id: 'rs0', members: [{ _id: 0, host }] } });
  await mongoose.disconnect();
  await mongoose.connect(`${directUri}${directUri.includes('?') ? '&' : '?'}replicaSet=rs0`);
}, 60000); // first run downloads the MongoDB binary -- give it time

// Clears all collections between individual test files so tests don't
// leak state into each other, without paying the cost of a fresh server.
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop().catch(() => {});
});
