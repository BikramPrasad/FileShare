const fs = require('fs');
const path = './temp';

// Check if the 'temp' folder exists, if not, create it
if (!fs.existsSync(path)) {
  fs.mkdirSync(path, { recursive: true });
  console.log('Folder "temp" has been created.');
} else {
  console.log('Folder "temp" already exists.');
}
