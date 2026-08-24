const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Falls back to your friend's MongoDB URI and database name: INTrackDB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/INTrackDB';

    const conn = await mongoose.connect(uri, {
      autoIndex: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;