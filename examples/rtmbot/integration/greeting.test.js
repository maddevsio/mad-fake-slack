const { startBot, waitMs } = require("./utils");

describe("Bot's greeting", () => {
  let bot = null;
  beforeAll(async () => {
    await page.goto("http://0.0.0.0:9001");
  });

  beforeEach(async () => {
    bot = startBot();
    await waitMs(2000); // Wait for bot starts
  });

  describe("when starts", () => {
    it("should display greeting", async () => {
      await expect(page).toMatchElement("span.c-message__body", { text: "Hello there! I am a Valera!" });
      const messages = await page.$$eval("span.c-message__body", spans => Array.from(spans).map(el => el.textContent.trim()));
      expect(messages.length).toBe(1);
    });
  });

  afterEach(async () => {
    if (bot) {
      await bot.destroy();
      await waitMs(1000);
    };
  });
});
