const fs = require('fs');
const path = require('path');
const modules = {};
require('fs').readdirSync(__dirname).forEach((file) => {
  if (file.match(/\.json$/) !== null && file !== 'index.js') {
    const name = file.replace('.json', '');
    modules[name] = JSON.parse(fs.readFileSync(path.join(__dirname, file)));
  }
});

module.exports = modules;
