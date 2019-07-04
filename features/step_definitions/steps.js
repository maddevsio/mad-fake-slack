const expect = require('expect');
const Promise = require('bluebird');

const {
  Given,
  // When,
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
