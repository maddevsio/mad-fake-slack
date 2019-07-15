const expect = require('expect');
const Promise = require('bluebird');

const {
  Given,
  When,
  Then
} = require('cucumber');

const actions = require('./actions');

Given('I am on {string} page', async (pagePath) => {
  await actions.visitPage(pagePath);
});

Then('I should see {string} in {string}', async (expectedText, selectorName) => {
  const actualText = await actions.getText(selectorName);
  expect(actualText).toStrictEqual(expectedText);
});

Then('I should see {string} in {string} on the {string} position', async (expectedText, selectorName, position) => {
  const actualText = await actions.getTextByPosition(selectorName, position || 'last');
  expect(actualText).toStrictEqual(expectedText);
});

Given('My timezone is {string}', (timezoneName) => {
  actions.setTimezone(timezoneName);
});

Then('I should see following channels between {string} and {string}:', async (afterText, beforeText, dataTable) => {
  const texts = await actions.getTextsBetween('[role="listitem"]', afterText, beforeText);
  expect(texts).toStrictEqual(dataTable.rows().map(row => row[0]));
});

Then('I should see {string} as selected channel', async (channelName) => {
  const actualSelectedChannel = await actions.getText('Selected channel');
  expect(actualSelectedChannel).toStrictEqual(channelName);
});

Then('I should see icon {string} in {string}', async (iconSelectonName, containerSelectorName) => {
  const has = await actions.hasElement(containerSelectorName, iconSelectonName);
  expect(has).toBeTruthy();
});

Then('I should see the following controls in {string}:', async (containerSelectorName, dataTable) => {
  const componentSelectors = dataTable.rows().map(row => row[0]);
  const expectedResults = componentSelectors.map(item => ({ [item]: true }));

  const actualResult = await Promise.mapSeries(componentSelectors, async (selectorName) => {
    const has = await actions.hasElement(containerSelectorName, selectorName);
    return { [selectorName]: has };
  });

  expect(actualResult).toStrictEqual(expectedResults);
});

Then('I should see {string} messages', async (count) => {
  const expectedCount = +count;
  const actualCount = await actions.countOfElements('Messages container', 'Message item');
  expect(actualCount).toStrictEqual(expectedCount);
});

Given('User {string} connected to fake slack using parameters:', async (name, dataTable) => {
  const params = dataTable.rowsHash();
  actions.createFakeUser(name, params);
  await actions.connectFakeUser(name);
});

Given('I type {string}', async (text) => {
  await actions.typeText(text);
});

When('I press the {string} keyboard button', async (buttonName) => {
  await actions.pressTheButton(buttonName);
});

Then('User {string} should receive message {string}', (userName, expectedMessage) => {
  const message = actions.getLastIncomingMessageTextForUser(userName);
  expect(message).toStrictEqual(expectedMessage);
});

Given('I click on {string} with text {string}', async (selectorName, text) => {
  await actions.clickOn(selectorName, { text });
});

Then('User {string} should receive messages:', (userName, dataTable) => {
  const rows = dataTable.rows();
  const expected = rows.map(row => [...row, true]);
  expect(actions.checkIsMessagesReceivedByUserFromChannel(userName, rows)).toStrictEqual(expected);
});

Then('User {string} should receive status messages:', (userName, dataTable) => {
  const rows = dataTable.rows();
  const expected = rows.map(row => [...row, true]);
  expect(actions.checkIsStatusMessagesReceivedByUserFromChannel(userName, rows)).toStrictEqual(expected);
});

Then('User {string} should receive {string} payload with {string} type:', async (userName, messageDirection, payloadType, dataTable) => {
  const payload = dataTable.rows();
  if (messageDirection === 'incoming') {
    const message = await actions.waitForAnswer(() => actions.getLastIncomingPayloadForUser(userName, payloadType), 1000, 3);
    expect(actions.validateIncomingMessage(message, payload)).toStrictEqual([]);
  }
});

Given('Fake slack db is empty', () => {
  actions.resetDb();
});
