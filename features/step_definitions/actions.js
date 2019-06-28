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

function interceptRequest (url, response) {
  scope.interceptRequests[url] = response;
}

async function getText (selectorName) {
  await initBrowser();
  const selector = scope.context.currentSelectors[selectorName];
  return scope.context.currentPage.$eval(selector, element => Array.from(element.textContent.matchAll(/\S+/g)).join(" "));
}

async function hasElement (containerSelectorName, elementSelectorName) {
  await initBrowser();
  const containerSelector = scope.context.currentSelectors[containerSelectorName];
  const elementSelector = scope.context.currentSelectors[elementSelectorName];
  return !!scope.context.currentPage.$(`${containerSelector} > ${elementSelector}`);
}

async function countOfElements (containerSelectorName, elementSelectorName) {
  await initBrowser();
  const containerSelector = scope.context.currentSelectors[containerSelectorName];
  const elementSelector = scope.context.currentSelectors[elementSelectorName];
  return scope.context.currentPage.$$eval(`${containerSelector} > ${elementSelector}`, elements => elements.length);
}

async function getTextsBetween (itemsSelector, afterText, beforeText) {
  await initBrowser();
  return scope.context.currentPage.$$eval(itemsSelector, (elements, afterText, beforeText) => {
    const texts = [];
    let beginTextFound = false;
    for (let element of elements) {
      const elementTextContent = element.textContent.trim();

      if (elementTextContent === beforeText) {
        break;
      }

      if (beginTextFound) {
        texts.push(elementTextContent);
      }

      if (elementTextContent === afterText) {
        beginTextFound = true;
      }
    }
    return texts;
  }, afterText, beforeText);
}

module.exports = {
  wait,
  goToUrl,
  getText,
  visitPage,
  reloadPage,
  hasElement,
  waitForUrl,
  waitForText,
  setTimezone,
  setLanguages,
  countOfElements,
  interceptRequest,
  loadPageSelectors,
  waitForNavigation,
  waitForElementHides,
  getTextsBetween
};
