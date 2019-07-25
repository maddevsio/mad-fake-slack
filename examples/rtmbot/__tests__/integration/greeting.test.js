const shared = require('./shared');
const actions = require('./actions');

describe("Bot's greeting", () => {
  let bot = null;

  beforeEach(async () => {
    bot = await shared.setup();
  });

  describe('when starts', () => {
    it('should display greeting', async () => {
      await expect(page).toMatchElement('span.c-message__body', { text: 'Hello there! I am a Valera!' });
      const messages = await actions.getMessages(page);
      expect(messages).toHaveLength(1);
    });
  });

  afterEach(async () => {
    await shared.teardown(bot);
  });
});
