
const { startBot, waitMs, resetDb } = require('./utils');

async function setup() {
  await resetDb();
  await page.goto('http://0.0.0.0:9001');
  return startBot();
}

async function teardown(bot) {
  if (bot) {
    await bot.destroy();
    await waitMs(1000);
    await resetDb();
  }
}

module.exports = {
  setup,
  teardown
};
