const {
  setWorldConstructor
} = require('cucumber');

const puppeteer = require('puppeteer');
const scope = require('./support/scope');

// eslint-disable-next-line func-names
function World() {
  scope.host = 'http://localhost:9001';
  scope.driver = puppeteer;
  scope.context = {};
  scope.interceptRequests = {};
  scope.locale = {};
  scope.locale.languages = ['en-US', 'en'];
  scope.locale.language = ['en-US'];
  scope.locale.timeZone = 'Asia/Almaty';
}

setWorldConstructor(World);
