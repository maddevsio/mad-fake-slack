const fs = require("fs");
const path = require("path");
const modules = {};
require("fs").readdirSync(__dirname).forEach(function (file) {
  if (file.match(/\.json$/) !== null && file !== "index.js") {
    var name = file.replace(".json", "");
    modules[name] = JSON.parse(fs.readFileSync(path.join(__dirname, file)));
  }
});

module.exports = modules;
