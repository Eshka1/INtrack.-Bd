require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./src/app');
const nodeCron = require('node-cron');
const { RawMaterial } = require('./src/models/Schemas.js');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/INTrackDB';

// Initialize background automated jobs
const initBackgroundJobs = () => {
  // Low-stock threshold checker scheduled daily at midnight
  nodeCron.schedule('0 0 * * *', async () => {
    try {
      const lowStockItems = await RawMaterial.aggregate([
        { $match: { $expr: { $lte: ['$itemqty', '$safety_threshold'] } } }
      ]);
      if (lowStockItems.length > 0) {
        console.log(`[ALERT] ${lowStockItems.length} inventory item(s) below safe threshold.`);
      }
    } catch (error) {
      console.error('Error running automated stock checks:', error.message);
    }
  });
};

// Create HTTP server
const server = http.createServer(app);

// Connect to MongoDB and start listening
mongoose
  .connect(MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log(`MongoDB Connected successfully to ${MONGO_URI}`);
    initBackgroundJobs();
    server.listen(PORT, () => {
      console.log(`IN-Track backend server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  });

// Handle graceful shutdowns
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to application termination');
  process.exit(0);
});