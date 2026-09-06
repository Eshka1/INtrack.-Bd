const fs = require("fs");
const path = require("path");

module.exports = async () => {
  const store = path.join(__dirname, "..", "data", "store.json");
  const backup = path.join(__dirname, "..", "data", "store.test-backup.json");

  if (fs.existsSync(backup)) {
    fs.copyFileSync(backup, store);
    fs.unlinkSync(backup);
  }
};
