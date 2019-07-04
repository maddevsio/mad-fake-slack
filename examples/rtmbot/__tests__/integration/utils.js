const spawnd = require('spawnd');
const fetch = require('node-fetch');
const Bluebird = require('bluebird');
fetch.Promise = Bluebird;

const SLACK_URL = 'http://0.0.0.0:9001';

async function waitMs(milliseconds = 0) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function startBot() {
  const proc = spawnd('npm run example:rtmbot', { shell: true });
  await waitMs(2000); // Wait until bot starts
  return proc;
}

async function resetDb() {
  return fetch(`${SLACK_URL}/test/api/db/reset`);
}

module.exports = {
  startBot,
  waitMs,
  resetDb
};
