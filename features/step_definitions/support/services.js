const createUIServer = require('../../../index');

module.exports = {
  ui: {
    server: createUIServer({
      httpPort: 9001,
      httpHost: 'localhost'
    })
  }
};
