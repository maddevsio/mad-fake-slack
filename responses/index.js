const path = require('path');
const modules = {}
require('fs').readdirSync(__dirname).forEach(function (file) {
    if (file.match(/\.json$/) !== null && file !== 'index.js') {
        var name = file.replace('.json', '');
        modules[name] = require(path.join(__dirname, file));
    }
});

module.exports = modules;