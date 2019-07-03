// Dependencies
const {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout
} = require('cucumber');

const scope = require('./support/scope');
const services = require('./support/services');
setDefaultTimeout(2 * 60 * 1000);

BeforeAll(async () => {
  await services.ui.server.start();
});

Before(async () => {
  // Here we check if a scenario has instantiated a browser and a current page
  if (scope.browser && scope.context.currentPage) {
    // if it has, find all the cookies, and delete them
    const cookies = await scope.context.currentPage.cookies();
    if (cookies && cookies.length > 0) {
      await scope.context.currentPage.deleteCookie(...cookies);
    }
    await page.evaluate(() => {
      localStorage.clear();
    });
    // close the web page down
    await scope.context.currentPage.close();
    // wipe the context's currentPage value
    scope.context.currentPage = null;
  }
});

After(async () => {
  // Here we check if a scenario has instantiated a browser and a current page
  if (scope.browser && scope.context.currentPage) {
    // if it has, find all the cookies, and delete them
    const cookies = await scope.context.currentPage.cookies();
    if (cookies && cookies.length > 0) {
      await scope.context.currentPage.deleteCookie(...cookies);
    }
    await scope.context.currentPage.evaluate(() => {
      localStorage.clear();
    });
    // close the web page down
    await scope.context.currentPage.close();
    // wipe the context's currentPage value
    scope.context.currentPage = null;
  }
});

AfterAll(async () => {
  if (scope.browser) await scope.browser.close();
  if (services.ui.server) await services.ui.server.close();
});

async function clearResources() {
  if (services.ui.server) await services.ui.server.close();
}

process.on('exit', clearResources);
process.on('SIGINT', clearResources);
process.on('SIGTERM', clearResources);
