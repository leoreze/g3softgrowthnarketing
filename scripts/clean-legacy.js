const fs = require('fs');
const path = require('path');

const legacy = path.resolve(__dirname, '..', 'src', 'db', 'local-prepare.js');
if (fs.existsSync(legacy)) {
  fs.rmSync(legacy, { force: true });
  console.log('Removed legacy file: src/db/local-prepare.js');
} else {
  console.log('No legacy local-prepare.js found.');
}
