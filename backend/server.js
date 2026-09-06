require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { seedSubscriptionTiers } = require('./utils/seedSubscriptionTiers');

/**
 * Production and development entry point:
 * Connects to MongoDB, seeds necessary database catalogs,
 * and starts listening on the designated network port.
 */
const start = async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Seed default subscription tiers if available
    if (typeof seedSubscriptionTiers === 'function') {
      await seedSubscriptionTiers();
    }

    // 3. Bind network port (5050 maintains Module 2 frontend compatibility)
    const PORT = process.env.PORT || 5050;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

start();

module.exports = app;