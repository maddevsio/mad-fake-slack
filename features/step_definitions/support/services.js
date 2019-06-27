const createUIServer = require("../../../index");

module.exports = {
  ui: {
    server: createUIServer({
      port: 9001,
      host: "localhost"
    })
  }
};
