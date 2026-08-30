const app = require('./app');
const connectDB = require('./config/database');

// Production/dev entrypoint: connect to the real database, then start
// listening. Kept separate from app.js so tests can import the Express
// app on its own, without touching a real database or network port.
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
