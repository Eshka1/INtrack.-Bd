require('dotenv').config();

if (process.env.NODE_ENV !== 'production' && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'intrack-local-development-secret-change-before-production';
}

const app = require('./app');
const connectDB = require('./config/database');
const { seedSubscriptionTiers } = require('./utils/seedSubscriptionTiers');

const localFallbackAllowed = () =>
  process.env.NODE_ENV !== 'production' &&
  String(process.env.ALLOW_LOCAL_AUTH_FALLBACK || 'true').toLowerCase() !== 'false';

const start = async () => {
  let databaseMode = 'mongodb';

  try {
    await connectDB();
    await seedSubscriptionTiers();
  } catch (error) {
    if (!localFallbackAllowed()) throw error;
    databaseMode = 'local-auth-fallback';
    console.warn(`MongoDB unavailable (${error.message}).`);
    console.warn('Starting in local authentication fallback mode for development.');
  }

  app.locals.databaseMode = databaseMode;
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Database mode: ${databaseMode}`);
  });

  return server;
};

if (require.main === module) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

app.start = start;
module.exports = app;
