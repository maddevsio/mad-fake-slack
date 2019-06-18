const path = require("path");
const fs = require("fs");
const clientHelpers = require("./public/js/helpers.js");

module.exports = {
  ...clientHelpers,
  include: function (...args) {
    const parts = args.slice(0, -1);
    let filePath = path.join("views", ...parts);
    if (!filePath.endsWith(".hbs")) {
      filePath = `${filePath}.hbs`;
    }
    return fs.readFileSync(filePath, { encoding: "utf-8" });
  }
};
