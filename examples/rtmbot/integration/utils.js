const spawnd = require("spawnd");
const fetch = require("node-fetch");
const Bluebird = require("bluebird");
fetch.Promise = Bluebird;

function startBot () {
  return spawnd("npm run example:rtmbot", { shell: true });
}
function startSlack () {
  return new Promise((resolve, reject) => {
    const proc = spawnd("npm start", { shell: true });
    let count = 0;
    const intervalId = setInterval(() => {
      fetch("http://0.0.0.0:9001", intervalId).then(() => {
        clearInterval(intervalId);
        resolve(proc);
      }).catch((e) => {
        count += 1;
        if (count > 10) {
          clearInterval(intervalId);
          reject(Error("Retry count exceeded"));
        }
      });
    }, 200);
  });
}

async function waitMs (milliseconds = 0) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

module.exports = {
  startSlack,
  startBot,
  waitMs
};
