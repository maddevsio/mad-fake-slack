const expect = require('expect');
const scope = require('./support/scope');
const selectors = require('./selectors');
const pages = require('./pages');
const { user, ui } = require('./support/services');
const { dbManager } = require('../../routes/managers');
const { CustomJSONSchemaValidator } = require('./support/validators');
const Validator = CustomJSONSchemaValidator(require('jsonschema').Validator);
const jsonSchemaValidator = new Validator();
const fetch = require('node-fetch');
const Promise = require('bluebird');
fetch.Promise = Promise;

const VIEWPORT = [1920, 1080];

function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

function checkIsUserRegistered(name) {
  if (!scope.context.appUsers[name]) {
    throw new Error(`No registered users with name ${name} to start`);
  }
}

function parseBoolean(value, defaultValue) {
  let boolValue = value;
  if (typeof value === 'undefined') return defaultValue;
  if (typeof value === 'string') {
    boolValue = boolValue.trim().toLowerCase();
  }
  return ['true', 1, '1'].includes(boolValue);
}

async function getActivePage() {
  const page = await Promise.filter(scope.browser.pages(), async (p) => {
    return p === scope.context.currentPage;
  }).get(0);
  if (!page) {
    throw new Error('Unable to get active page');
  }
  scope.context.currentPage = page;
  return page;
}

async function initBrowser() {
  if (!scope.browser) {
    const useSandbox = parseBoolean(process.env.USE_SANDBOX, false);
    const headless = parseBoolean(process.env.HEADLESS, true);
    const slowMo = parseInt((process.env.SLOW_MO || '0').trim(), 10);
    const dumpio = parseBoolean(process.env.DUMPIO, false);
    const executablePath = process.env.EXECUTABLE_BROWSER_PATH || 'google-chrome-stable';
    const useRemoteDebug = parseBoolean(process.env.USE_REMOTE_DUBUG, false);

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

    const context = scope.browser.defaultBrowserContext();
    await context.overridePermissions(scope.host, ['clipboard-write', 'clipboard-read']);
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

  await scope.context.currentPage.evaluateOnNewDocument((locale, mockDate) => {
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

    window.OrigDate = window.Date;
    window.Date = class MockDate extends Date {
      constructor(date) {
        if (!MockDate.mockedDate) {
          return super(date);
        }
        return super(MockDate.mockedDate.getTime());
      }

      static mockDateIncreaseMinutes(minutes = 0) {
        if (MockDate.mockedDate) {
          MockDate.mockedDate.setMinutes(MockDate.mockedDate.getMinutes() + minutes);
        }
      }

      static now() {
        if (MockDate.mockedDate) {
          return MockDate.mockedDate.getTime();
        }
        return window.OrigDate.now();
      }

      static mockDate(date) {
        MockDate.mockedDate = date;
      }

      static unmockDate() {
        MockDate.mockedDate = null;
      }
    };

    if (mockDate) {
      window.Date.mockDate(mockDate);
    } else {
      window.Date.unmockDate();
    }
  }, scope.locale, scope.mockDate && scope.mockedDate.getTime());

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

async function setTodayDate(dateISOString) {
  const page = await getActivePage();
  await page.evaluate((dateISO) => {
    window.Date.mockDate(new Date(dateISO));
  }, dateISOString);
}

async function increaseTodayDateByMinutes(countOfMinutes) {
  const page = await getActivePage();
  await page.evaluate((minutes) => {
    window.Date.mockDateIncreaseMinutes(minutes);
  }, countOfMinutes);
}

async function waitForNavigation() {
  const page = await getActivePage();
  await page.waitForNavigation();
}

async function waitForUrl(pageName) {
  const expecetedUrl = pages[pageName];
  const page = await getActivePage();
  const url = await page.url();
  expect(url).toEqual(`${scope.host}${expecetedUrl}`);
}

async function waitForText(text) {
  const page = await getActivePage();
  await page.waitForXPath(
    `//*[contains(normalize-space(string(.)), '${text}')]`
  );
}

async function waitForElementHides(elementType, elementName) {
  const selector = scope.context.currentSelectors[elementType][elementName];
  const page = await getActivePage();
  await page.waitForXPath(selector, {
    hidden: true
  });
}

async function wait(ms) {
  const page = await getActivePage();
  await page.waitFor(ms);
}

async function goToUrl(url) {
  const page = await getActivePage();
  return page.goto(url, {
    waitUntil: 'networkidle2'
  });
}

async function reloadPage() {
  const page = await getActivePage();
  await page.reload({ waitUntil: 'networkidle2' });
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
  const page = await getActivePage();
  await page.waitForSelector(selector, { visible: true });
  return page.$eval(selector, element => Array.from(element.textContent.matchAll(/\S+/g)).join(' '));
}

async function hasElement(containerSelectorName, elementSelectorName) {
  await initBrowser();
  const containerSelector = scope.context.currentSelectors[containerSelectorName];
  const elementSelector = scope.context.currentSelectors[elementSelectorName];
  const page = await getActivePage();
  return !!page.$(`${containerSelector} > ${elementSelector}`);
}

async function countOfElements(containerSelectorName, elementSelectorName) {
  await initBrowser();
  const containerSelector = scope.context.currentSelectors[containerSelectorName];
  const elementSelector = scope.context.currentSelectors[elementSelectorName];
  const page = await getActivePage();
  return page.$$eval(`${containerSelector} > ${elementSelector}`, elements => elements.length);
}

async function getTextsBetween(itemsSelector, afterText, beforeText) {
  await initBrowser();
  const page = await getActivePage();
  return page.$$eval(itemsSelector, (elements, beginText, endText) => {
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
  try {
    checkIsUserRegistered(name);
  } catch (e) {
    const bot = user.create(params);
    scope.context.appUsers[name] = bot;
  }
}

async function connectFakeUser(name) {
  checkIsUserRegistered(name);
  await scope.context.appUsers[name].start();
}

async function typeText(text, options = { delay: 0 }) {
  await initBrowser();
  const page = await getActivePage();
  await page.keyboard.type(text, options);
}

async function pressTheButton(button) {
  await initBrowser();
  const page = await getActivePage();
  const { keyboard } = page;
  const keys = button.split('+').map(k => k.trim());
  await Promise.mapSeries(keys.slice(0, -1), key => keyboard.down(key));
  await keyboard.press(keys[keys.length - 1]);
  await Promise.mapSeries(keys.slice(0, -1), key => keyboard.up(key));
}

function getLastIncomingMessageTextForUser(name) {
  checkIsUserRegistered(name);
  const message = scope.context.appUsers[name].getLastIncomingMessage();
  if (!message) {
    throw new Error(`No messages found for user ${name}`);
  }
  return message.text;
}

function getLastIncomingPayloadForUser(name, payloadType) {
  checkIsUserRegistered(name);
  const message = scope.context.appUsers[name].getLastIncomingPayload(payloadType);
  if (!message) {
    throw new Error(`No messages found for user ${name}`);
  }
  return message;
}

async function findElement(options) {
  const page = await getActivePage();
  return page.waitForFunction(({ text, selector: elementSelector }) => {
    if (text) {
      const elements = Array.from(document.querySelectorAll(elementSelector));
      const getTextContent = el => el.textContent
        .replace(/\s+/g, ' ')
        .trim();

      const filterByText = el => getTextContent(el) === text;
      const filterByTextRegexp = el => getTextContent(el).match(text) !== null;

      let selectedFilter = text instanceof RegExp ? filterByTextRegexp : filterByText;
      const elementsWithText = elements.filter(selectedFilter);

      if (elementsWithText.length) {
        return elementsWithText[0];
      }
    } else {
      const htmlElement = document.querySelector(elementSelector);
      if (htmlElement) {
        return htmlElement;
      }
    }
    return false;
  }, {}, options);
}

async function clickOn(selectorName, options = {}, noNav = false) {
  await initBrowser();
  const selector = scope.context.currentSelectors[selectorName];
  if (!selector) {
    throw new Error(`[${clickOn.name}] Selector by name ${selectorName} not found!`);
  }
  const page = await getActivePage();
  const element = await findElement({ selector, ...options });
  if (!element) {
    throw new Error(`No element found with selector ${selector} and name ${selectorName}`);
  }

  if (noNav) {
    return Promise.race([
      wait(1000),
      element.click()
    ]);
  }

  return Promise.all([
    page.waitForNavigation(),
    element.click()
  ]);
}

async function getTextByPosition(selectorName, position, attribute = 'textContent', matchRegex = /\s+/g) {
  const FIRST_POSITION = 'first';
  const LAST_POSITION = 'last';
  const page = await getActivePage();
  if (![LAST_POSITION, FIRST_POSITION].includes(position)) {
    throw new Error(`[${getTextByPosition.name}] Invalid value for "position"! Valid values: [${position}]`);
  }
  await initBrowser();
  const selector = scope.context.currentSelectors[selectorName];
  const textContents = await page.$$eval(selector,
    (elements, attr, [regex, flags]) => elements.map(el => (el[attr] || el.value || el.innerHTML || el.innerText)
      .replace(new RegExp(regex, flags), ' ')
      .replace(new RegExp(String.fromCharCode(160), 'g'), ' ')
      .trim()),
    attribute,
    [matchRegex.source, matchRegex.flags]);
  return textContents[position === FIRST_POSITION ? 0 : textContents.length - 1];
}

async function getHtmlByPosition(selectorName, position, attribute = 'innerHTML') {
  const FIRST_POSITION = 'first';
  const LAST_POSITION = 'last';
  const page = await getActivePage();
  if (![LAST_POSITION, FIRST_POSITION].includes(position)) {
    throw new Error(`[${getHtmlByPosition.name}] Invalid value for "position"! Valid values: [${position}]`);
  }
  await initBrowser();
  const selector = scope.context.currentSelectors[selectorName];
  const textContents = await page.$$eval(selector, (elements, attr) => elements.map(el => el[attr] && el[attr].trim()), attribute);
  return textContents[position === FIRST_POSITION ? 0 : textContents.length - 1];
}

function iterateLastIncomingMessages(userName, rows, cb) {
  const channelNameColumnIndex = 1;
  const messagesByChannels = groupBy(rows, row => row[channelNameColumnIndex]);
  const channelNames = Array.from(messagesByChannels.keys());

  const channelIds = channelNames.reduce((all, name) => {
    const channel = dbManager.db.channels.filter(ch => ch.name === name)[0];
    // eslint-disable-next-line no-param-reassign
    all[name] = channel.id;
    return all;
  }, {});

  const result = [];
  Array.from(messagesByChannels.entries()).forEach(([channelName, channelMessages]) => {
    const messages = scope.context.appUsers[userName].getLastIncomingMessagesByChannelId(channelIds[channelName], channelMessages.length);
    cb(messages, channelMessages);
  });
  return result;
}


function checkIsMessagesReceivedByUserFromChannel(userName, rows) {
  const result = [];
  iterateLastIncomingMessages(userName, rows, (messages, channelMessages) => {
    const texts = messages.map(message => message.text);
    channelMessages.forEach(
      ([message, channel]) => result.push(
        [message, channel, texts.includes(message)]
      )
    );
  });
  return result;
}

function checkIsStatusMessagesReceivedByUserFromChannel(userName, rows) {
  const result = [];
  iterateLastIncomingMessages(userName, rows, (messages, channelMessages) => {
    const types = Array.from(messages.reduce((set, message) => {
      set.add(message.type);
      return set;
    }, new Set()).values());
    channelMessages.forEach(
      ([type, channel]) => result.push(
        [type, channel, types.includes(type)]
      )
    );
  });
  return result;
}

function validateIncomingMessage(messageObject, schemaRows) {
  const { properties, required } = schemaRows.reduce((schema, row) => {
    const propName = row[0];
    const item = { type: row[1] };
    if (row[3]) {
      item.format = row[3];
    }
    // eslint-disable-next-line no-param-reassign
    schema.properties[propName] = item;
    if (row[2] === 'true') {
      schema.required.push(propName);
    }
    return schema;
  }, { properties: {}, required: [] });

  const schema = {
    id: '/IncomingMessage',
    type: 'object',
    properties,
    required
  };

  const validationResult = jsonSchemaValidator.validate(messageObject, schema);
  return validationResult.errors;
}

function resetDb() {
  dbManager.reset();
}

async function waitForAnswer(fn, interval, maxFailCount = 1) {
  return new Promise((resolve, reject) => {
    let failCounter = 0;
    let id;
    function clearResources(timerId) {
      if (timerId) {
        clearTimeout(timerId);
      }
    }
    async function check() {
      try {
        resolve(await fn());
        clearResources(id);
      } catch (e) {
        if (failCounter >= maxFailCount) {
          clearResources(id);
          reject(e);
        }
        failCounter += 1;
      }
    }
    id = setInterval(check, interval);
  });
}

async function sendMessageFrom(userName, channelName, options) {
  const { type } = options;
  const methodsByTypeMap = {
    user_typing() {
      return scope.context.appUsers[userName]
        .sendUserTypingToChannel(channelName);
    },
    message() {
      return scope.context.appUsers[userName]
        .sendTextMessageToChannel(channelName, options.text);
    }
  };
  return methodsByTypeMap[type] && methodsByTypeMap[type]();
}

function setTodayBotDate(userName, isoDate) {
  scope.context.appUsers[userName].setMockDate(new Date(isoDate));
}

function increaseTodayBotDateByMinutes(userName, minutes) {
  scope.context.appUsers[userName].increaseMockDateByMinutes(minutes);
}

async function getContentsByParams(options, { position = 'last', attribute = 'textContent', matchRegex = /\s+/g }) {
  return Promise.mapSeries(
    Object.entries(options),
    ([selectorName]) => getTextByPosition(selectorName, position, attribute, matchRegex)
  );
}

async function getItemContentsByParams(options, itemSelectorName, { position = 'last' }) {
  await initBrowser();
  const itemSelector = scope.context.currentSelectors[itemSelectorName];
  const page = await getActivePage();

  const itemHandler = (items, opts, selectorsFromContext) => {
    return Array.from(items).map(
      item => Object.keys(opts).reduce(
        (accum, itemChildSelectorName) => {
          const itemChildSelector = selectorsFromContext[itemChildSelectorName];
          const itemChildEl = item.querySelector(itemChildSelector);
          const itemContent = (itemChildEl && (itemChildEl.innerText || itemChildEl.value || itemChildEl.innerHTML || itemChildEl.textContent)) || '<not exists>';
          return {
            ...accum,
            // eslint-disable-next-line no-useless-escape
            [itemChildSelectorName]: itemContent.replace(new RegExp(' +', 'g'), ' ')
              .replace(new RegExp(String.fromCharCode(160), 'g'), ' ')
              .trim()
          };
        },
        {}
      )
    );
  };
  const elements = await page.$$eval(itemSelector, itemHandler, options, scope.context.currentSelectors);
  return elements[({ last: elements.length - 1, first: 0 })[position] || 0];
}

async function copyTextToClipboard(text) {
  const page = await getActivePage();
  return page.evaluate(textValue => {
    return navigator.clipboard.writeText(textValue);
  }, text);
}

async function setMemorizeProperty(selectorName, propertyName) {
  const page = await getActivePage();
  const selector = scope.context.currentSelectors[selectorName];
  const propValue = await page.$eval(selector, (el, prop) => {
    return el[prop];
  }, propertyName);
  scope.memo[`${selectorName}:${propertyName}`] = propValue;
}

function getMemorizeProperty(selectorName, propertyName) {
  return scope.memo[`${selectorName}:${propertyName}`];
}

async function getPropertyValueBySelector(selectorName, propertyName) {
  const page = await getActivePage();
  const selector = scope.context.currentSelectors[selectorName];
  return page.$eval(selector, (el, prop) => {
    return el[prop];
  }, propertyName);
}

async function setFocus(selectorName) {
  const page = await getActivePage();
  const selector = scope.context.currentSelectors[selectorName];
  return page.focus(selector);
}

function runTimes(times, action) {
  const calls = new Array(Number(times)).fill(action);
  return Promise.mapSeries(calls, c => c());
}

async function setTextPositionTo(position) {
  const page = await getActivePage();
  return page.evaluate(pos => {
    const inputField = window.msg_input_text;
    const textLength = inputField.value.length || 1;
    const mapTextPosition = textPos => ({ starting: 1, ending: textLength }[textPos] || 1);
    // eslint-disable-next-line no-restricted-globals
    const textPosition = !isNaN(pos) ? Number(pos) : mapTextPosition(pos);
    inputField.focus();
    inputField.selectionEnd = textPosition;
  }, position);
}

async function restartApiServerWithEnvs(envs) {
  await ui.server.close();
  await ui.server.start(envs);
}

async function restartApiServer() {
  await ui.server.close();
  await ui.server.start();
}

async function makeJsonRequest({
  httpMethod,
  url,
  body,
  headers = { 'Content-Type': 'application/json' }
}) {
  const data = {
    method: httpMethod.toLowerCase(),
    headers
  };
  if (body) {
    data.body = JSON.stringify(body);
  }
  return fetch(url, data).then(res => res.json());
}

async function waitForToBeHidden(selectorName) {
  await initBrowser();
  const itemSelector = scope.context.currentSelectors[selectorName];
  const page = await getActivePage();
  await page.waitFor(selector => !document.querySelector(selector), { timeout: 3000 }, itemSelector);
}

async function typeMultilineMessage(text) {
  const lines = text.split('\n');
  await Promise.mapSeries(lines, async (line, index, length) => {
    await typeText(line);
    const canInsertLineBreak = index < length - 1;
    if (canInsertLineBreak) {
      await pressTheButton('Control + Enter');
    }
  });
}

async function shouldNotSee(selectorName) {
  await this.waitForToBeHidden(selectorName);
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
  getLastIncomingMessageTextForUser,
  clickOn,
  getTextByPosition,
  getHtmlByPosition,
  checkIsMessagesReceivedByUserFromChannel,
  validateIncomingMessage,
  resetDb,
  waitForAnswer,
  checkIsStatusMessagesReceivedByUserFromChannel,
  getLastIncomingPayloadForUser,
  sendMessageFrom,
  getContentsByParams,
  copyTextToClipboard,
  setMemorizeProperty,
  getMemorizeProperty,
  getPropertyValueBySelector,
  setFocus,
  runTimes,
  setTextPositionTo,
  restartApiServerWithEnvs,
  restartApiServer,
  makeJsonRequest,
  getItemContentsByParams,
  setTodayDate,
  increaseTodayDateByMinutes,
  setTodayBotDate,
  increaseTodayBotDateByMinutes,
  waitForToBeHidden,
  typeMultilineMessage,
  shouldNotSee
};
