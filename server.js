// Keep the repository-root command compatible with the actual backend layout.
// Imports expose the app for tests; direct execution starts the backend.
const app = require('./backend/server');

if (require.main === module) {
  app.start();
}

module.exports = app;
