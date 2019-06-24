const { startBot, waitMs } = require("./utils");

describe("Channel communication", () => {
  let bot = null;
  beforeAll(async () => {
    await page.goto("http://0.0.0.0:9001");
  });

  beforeEach(async () => {
    bot = startBot();
    await waitMs(2000); // Wait for bot starts
  });

  describe("general channel", () => {
    describe("when user sent message", () => {
      it("bot should display echo message", async () => {
        await page.keyboard.type("Hello");
        await page.keyboard.press("Enter");
        await expect(page).toMatchElement("span.c-message__body", { text: "You sent text to the channel: Hello" });
      });
    });
  });

  describe("random channel", () => {
    describe("when user sent message", () => {
      it("bot should display echo message", async () => {
        await await Promise.all([
          page.waitForNavigation({ waitUntil: "load" }),
          expect(page).toClick("span.p-channel_sidebar__name", { text: "random" })
        ]);
        await page.keyboard.type("Hello from random!");
        await page.keyboard.press("Enter");
        await expect(page).toMatchElement("span.c-message__body", { text: "You sent text to the channel: Hello from random!" });
        const messages = await page.$$eval("span.c-message__body", spans => Array.from(spans).map(el => el.textContent));
        expect(messages.length).toBe(6);
        expect(messages[messages.length - 1].trim()).toEqual("You sent text to the channel: Hello from random!");
      });
    });
  });

  afterEach(async () => {
    if (bot) {
      await bot.destroy();
      await waitMs(1000);
    };
  });
});
