const { waitMs } = require('./utils');
const shared = require('./shared');

describe('Channel communication', () => {
  let bot = null;

  beforeEach(async () => {
    bot = await shared.setup();
  });

  describe('general channel', () => {
    describe('when user sent message', () => {
      it('bot should display echo message', async () => {
        await page.keyboard.type('Hello');
        await page.keyboard.press('Enter');
        await waitMs(500);
        await expect(page).toMatchElement('span.c-message__body',
          { text: 'You sent text to the channel: Hello' });
      });
    });
  });

  describe('random channel', () => {
    describe('when user sent message', () => {
      it('bot should display echo message', async () => {
        await await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          expect(page).toClick('span.p-channel_sidebar__name', { text: 'random' })
        ]);
        await page.keyboard.type('Hello from random!');
        await page.keyboard.press('Enter');
        await waitMs(500);
        await expect(page).toMatchElement('span.c-message__body',
          { text: 'You sent text to the channel: Hello from random!' });
        const messages = await page.$$eval('span.c-message__body',
          spans => Array.from(spans).map(el => el.textContent));
        expect(messages).toHaveLength(6);
        expect(messages[messages.length - 1].trim()).toEqual('You sent text to the channel: Hello from random!');
      });
    });
  });

  afterEach(async () => {
    await shared.teardown(bot);
  });
});
