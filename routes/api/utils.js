const helpers = require('../../public/js/helpers');

function copyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getChannelId(channel) {
  const result = /^[CWDU][A-Z0-9]{8}$/.exec(channel);
  return (Array.isArray(result) && result[0]) || null;
}

function isOpenChannel(channel) {
  return channel && channel.startsWith('C');
}

function isBot(channel, dbManager) {
  const users = dbManager.users().findById(channel, u => u.is_app_user || u.is_bot);
  return users.length;
}

function isUrlEncodedForm(req) {
  return req.headers['content-type'] === 'application/x-www-form-urlencoded';
}

function isMultipartForm(req) {
  return req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data');
}

module.exports = {
  copyObject,
  getChannelId,
  isOpenChannel,
  isBot,
  isUrlEncodedForm,
  isMultipartForm,
  createTs: helpers.createTs
};
