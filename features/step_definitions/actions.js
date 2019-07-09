const expect = require('expect');
const scope = require('./support/scope');
const selectors = require('./selectors');
const pages = require('./pages');
const { user } = require('./support/services');

const VIEWPORT = [1920, 1080];

async function initBrowser() {
  if (!scope.browser) {
    const useSandbox = process.env.USE_SANDBOX;
    const headless = (process.env.HEADLESS === undefined ? 'true' : process.env.HEADLESS).trim().toLowerCase() === 'true';
    const slowMo = parseInt((process.env.SLOW_MO || '0').trim(), 10);
    const dumpio = !!process.env.DUMPIO;
    const executablePath = process.env.EXECUTABLE_BROWSER_PATH || 'google-chrome-stable';
    const useRemoteDebug = (process.env.USE_REMOTE_DUBUG === undefined ? 'true' : process.env.USE_REMOTE_DUBUG).trim().toLowerCase() === 'true';

    const args = [
      `--window-size=${VIEWPORT}`
    ];
    if (useRemoteDebug) {
      args.push(
        '--remote-debugging-address=0.0.0.0',
        '--remote-debugging-port=9222'
      );
    }
    if (!useSandbox) {
      args.push('--no-sandbox', '--disable-setuid-sandbox');
    }
    scope.browser = await scope.driver.launch({
      args,
      handleSIGINT: true,
      executablePath,
      headless,
      slowMo,
      dumpio
    });
  }

  return scope.browser;
}

async function visitPage(currentPageName) {
  await initBrowser();
  scope.context.currentSelectors = selectors[currentPageName];
  scope.context.currentPage = await scope.browser.newPage();
  await scope.context.currentPage.setRequestInterception(true);
  await scope.context.currentPage.setExtraHTTPHeaders({
    'Accept-Language': scope.locale.language[0]
  });

  await scope.context.currentPage.evaluateOnNewDocument((locale) => {
    Object.defineProperty(navigator, 'language', {
      get() {
        return locale.language;
      }
    });

    Object.defineProperty(navigator, 'languages', {
      get() {
        return locale.languages;
      }
    });

    const [firstLang] = locale.language;
    Intl.DateTimeFormat = () => ({
      resolvedOptions: () => ({
        calendar: 'gregory',
        day: 'numeric',
        locale: firstLang,
        month: 'numeric',
        numberingSystem: 'latn',
        timeZone: locale.timeZone,
        year: 'numeric'
      })
    });
  }, scope.locale);

  scope.context.currentPage.on('request', async request => {
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
    waitUntil: 'networkidle2'
  });
  return visit;
}

function setLanguages(langs = ['en-US', 'en']) {
  const [language] = langs;
  scope.locale.languages = langs;
  scope.locale.language = [language];
}

function setTimezone(timeZone) {
  scope.locale.timeZone = timeZone;
}

async function waitForNavigation() {
  await scope.context.currentPage.waitForNavigation();
}

async function waitForUrl(pageName) {
  const expecetedUrl = pages[pageName];
  const url = await scope.context.currentPage.url();
  expect(url).toEqual(`${scope.host}${expecetedUrl}`);
}

async function waitForText(text) {
  await scope.context.currentPage.waitForXPath(
    `//*[contains(normalize-space(string(.)), '${text}')]`
  );
}

async function waitForElementHides(elementType, elementName) {
  const selector = scope.context.currentSelectors[elementType][elementName];
  await scope.context.currentPage.waitForXPath(selector, {
    hidden: true
  });
}

async function wait(ms) {
  await scope.context.currentPage.waitFor(ms);
}

async function goToUrl(url) {
  return scope.context.currentPage.goto(url, {
    waitUntil: 'networkidle2'
  });
}

async function reloadPage() {
  await scope.context.currentPage.reload();
}

function loadPageSelectors(currentPageName) {
  scope.context.currentSelectors = selectors[currentPageName];
}

function interceptRequest(url, response) {
  scope.interceptRequests[url] = response;
}

async function getText(selectorName) {
  await initBrowser();
  const selector = scope.context.currentSelectors[selectorName];
  return scope.context.currentPage.$eval(selector, element => Array.from(element.textContent.matchAll(/\S+/g)).join(' '));
}

async function hasElement(containerSelectorName, elementSelectorName) {
  await initBrowser();
  const containerSelector = scope.context.currentSelectors[containerSelectorName];
  const elementSelector = scope.context.currentSelectors[elementSelectorName];
  return !!scope.context.currentPage.$(`${containerSelector} > ${elementSelector}`);
}

async function countOfElements(containerSelectorName, elementSelectorName) {
  await initBrowser();
  const containerSelector = scope.context.currentSelectors[containerSelectorName];
  const elementSelector = scope.context.currentSelectors[elementSelectorName];
  return scope.context.currentPage.$$eval(`${containerSelector} > ${elementSelector}`, elements => elements.length);
}

async function getTextsBetween(itemsSelector, afterText, beforeText) {
  await initBrowser();
  return scope.context.currentPage.$$eval(itemsSelector, (elements, beginText, endText) => {
    const texts = [];
    let beginTextFound = false;
    // eslint-disable-next-line no-restricted-syntax
    for (let element of elements) {
      const elementTextContent = element.textContent.trim();

      if (elementTextContent === endText) {
        break;
      }

      if (beginTextFound) {
        texts.push(elementTextContent);
      }

      if (elementTextContent === beginText) {
        beginTextFound = true;
      }
    }
    return texts;
  }, afterText, beforeText);
}

function createFakeUser(name, params) {
  if (!scope.context.appUsers[name]) {
    const bot = user.create(params);
    scope.context.appUsers[name] = bot;
  } else {
    throw new Error(`User with name ${name} already exists and can't be created again`);
  }
}

async function connectFakeUser(name) {
  if (scope.context.appUsers[name]) {
    await scope.context.appUsers[name].start();
  } else {
    throw new Error(`No registered users with name ${name} to start`);
  }
}

async function typeText(text) {
  await scope.context.currentPage.keyboard.type(text);
}

async function pressTheButton(button) {
  await scope.context.currentPage.keyboard.press(button);
}

function getLastIncomingMessageTextForUser(name) {
  if (scope.context.appUsers[name]) {
    const message = scope.context.appUsers[name].getLastIncomingMessage();
    if (!message) {
      throw new Error(`No messages found for user ${name}`);
    }
    return message.text;
  }
  throw new Error(`No registered users with name ${name} to start`);
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
  getTextsBetween,
  createFakeUser,
  connectFakeUser,
  typeText,
  pressTheButton,
  getLastIncomingMessageTextForUser
};
