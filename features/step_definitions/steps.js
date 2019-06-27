const {
  Given,
  // When,
  Then
} = require("cucumber");

const actions = require("./actions");

Given("I am on {string} page", async function (pagePath) {
  await actions.visitPage(pagePath);
});

Then("I should see {string} in {string}", async function (text, selector) {
  await actions.hasTextIn(text, selector);
});

Given("My timezone is {string}", function (timezoneName) {
  actions.setTimezone(timezoneName);
});

Then("I should see following channels:", async function (dataTable) {
  await actions.hasChannels(dataTable.rows().map(row => row[0]));
});
