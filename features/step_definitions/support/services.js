const createUIServer = require('../../../index');
const FakeUser = require('./fakeuser');

module.exports = {
  ui: {
    server: createUIServer({
      httpPort: 9001,
      httpHost: 'localhost'
    })
  },
  user: {
    create({ token, url }) {
      return new FakeUser(token, url);
    }
  }
};
