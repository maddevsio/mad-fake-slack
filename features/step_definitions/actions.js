const expect = require("expect");
const scope = require("./support/scope");
const selectors = require("./selectors");
const pages = require("./pages");

const VIEWPORT = [1920, 1080];

async function initBrowser () {
  if (!scope.browser) {
    scope.browser = await scope.driver.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        `--window-size=${VIEWPORT}`
      ],
      executablePath: "google-chrome-stable"
    });
  }
  return scope.browser;
}

async function visitPage (currentPageName) {
  await initBrowser();
  scope.context.currentSelectors = selectors[currentPageName];
  scope.context.currentPage = await scope.browser.newPage();
  await scope.context.currentPage.setRequestInterception(true);
  await scope.context.currentPage.setExtraHTTPHeaders({
    "Accept-Language": scope.locale.language[0]
  });

  await scope.context.currentPage.evaluateOnNewDocument((locale) => {
    Object.defineProperty(navigator, "language", {
      get: function () {
        return locale.language;
      }
    });

    Object.defineProperty(navigator, "languages", {
      get: function () {
        return locale.languages;
      }
    });

    const [firstLang] = locale.language;
    Intl.DateTimeFormat = () => ({
      resolvedOptions: () => ({
        calendar: "gregory",
        day: "numeric",
        locale: firstLang,
        month: "numeric",
        numberingSystem: "latn",
        timeZone: locale.timeZone,
        year: "numeric"
      })
    });
  }, scope.locale);

  scope.context.currentPage.on("request", async request => {
    const interceptRequests = scope.interceptRequests;
    const url = request.url();
    if (interceptRequests[url]) {
      request.respond(interceptRequests[url]);
    } else {
      request.continue();
    }
  });

  scope.context.currentPage.setViewport({
    width: VIEWPORT[0],
    height: VIEWPORT[1]
  });

  const urlPath = pages[currentPageName];
  const url = `${scope.host}${urlPath}`;
  const visit = await scope.context.currentPage.goto(url, {
    waitUntil: "networkidle2"
  });
  return visit;
};

function setLanguages (langs = ["en-US", "en"]) {
  const [language] = langs;
  scope.locale.languages = langs;
  scope.locale.language = [language];
}

function setTimezone (timeZone) {
  scope.locale.timeZone = timeZone;
}

async function waitForNavigation () {
  await scope.context.currentPage.waitForNavigation();
}

async function waitForUrl (pageName) {
  const expecetedUrl = pages[pageName];
  const url = await scope.context.currentPage.url();
  expect(url).toEqual(`${scope.host}${expecetedUrl}`);
}

async function waitForText (text) {
  await scope.context.currentPage.waitForXPath(
    `//*[contains(normalize-space(string(.)), '${text}')]`);
}

async function waitForElementHides (elementType, elementName) {
  const selector = scope.context.currentSelectors[elementType][elementName];
  await scope.context.currentPage.waitForXPath(selector, {
    hidden: true
  });
}

async function wait (ms) {
  await scope.context.currentPage.waitFor(ms);
}

async function goToUrl (url) {
  return scope.context.currentPage.goto(url, {
    waitUntil: "networkidle2"
  });
}

async function reloadPage () {
  await scope.context.currentPage.reload();
}

function loadPageSelectors (currentPageName) {
  scope.context.currentSelectors = selectors[currentPageName];
}

async function clickOnText (text) {
  const element = await scope.context.currentPage.$x(`//*[contains(text(),'${text}')]`);
  expect(element).toHaveLength(1);
  await element[0].click();
}

function interceptRequest (url, response) {
  scope.interceptRequests[url] = response;
}

async function hasText (text) {
  await initBrowser();
  const element = await scope.context.currentPage.$x(`//*[contains(text(),'${text}')]`);
  expect(element).toHaveLength(1);
}

async function hasTextIn (text, selectorName) {
  const selectorExpression = scope.context.currentSelectors[selectorName];
  await initBrowser();
  const element = await scope.context
    .currentPage.$x(`//*[contains(text(),'${text}') ${selectorExpression}]`);
  expect(element).toHaveLength(1);
}

async function hasChannels (names) {
  const selector = scope.context.currentSelectors["channelSections"](names);
  const elements = await scope.context.currentPage.$x(selector);
  expect(elements).toHaveLength(names.length);
}

module.exports = {
  wait,
  goToUrl,
  hasText,
  hasTextIn,
  visitPage,
  reloadPage,
  waitForUrl,
  hasChannels,
  waitForText,
  clickOnText,
  setTimezone,
  setLanguages,
  interceptRequest,
  loadPageSelectors,
  waitForNavigation,
  waitForElementHides
};
