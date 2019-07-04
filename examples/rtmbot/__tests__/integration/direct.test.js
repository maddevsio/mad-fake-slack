const { startBot, waitMs, resetDb } = require('./utils');

describe('Direct channel communication', () => {
  let bot = null;

  beforeEach(async () => {
    await resetDb();
    await page.goto('http://0.0.0.0:9001');
    bot = await startBot();
  });

  describe('bot direct channel', () => {
    describe('when user sent message', () => {
      it('bot should display echo message', async () => {
        await await Promise.all([
          page.waitForNavigation({ waitUntil: 'load' }),
          expect(page).toClick('span.p-channel_sidebar__name', { text: /^Valera$/ })
        ]);
        await page.keyboard.type('Hello from direct!');
        await page.keyboard.press('Enter');
        await expect(page).toMatchElement('span.c-message__body',
          { text: 'You sent text to me (direct): Hello from direct!' });
        const messages = await page.$$eval('span.c-message__body',
          spans => Array.from(spans).map(el => el.textContent.trim()));
        expect(messages).toHaveLength(2);
        expect(messages[0].trim()).toEqual('Hello from direct!');
        expect(messages[1].trim()).toEqual('You sent text to me (direct): Hello from direct!');
      });
    });
  });

  afterEach(async () => {
    if (bot) {
      await bot.destroy();
      await waitMs(1000);
      await resetDb();
    }
  });
});
