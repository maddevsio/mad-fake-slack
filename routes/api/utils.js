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

function isBot(channel, db) {
  const users = db.users.filter(u => u.id === channel && (u.is_app_user || u.is_bot));
  return users.length;
}

function isUrlEncodedForm(req) {
  return req.headers['content-type'] === 'application/x-www-form-urlencoded';
}

function isMultipartForm(req) {
  return req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data');
}

function createTs(id) {
  return `${Math.round(+new Date() / 1000)}.${String(id).padStart(6, '0')}`;
}

module.exports = {
  copyObject,
  getChannelId,
  isOpenChannel,
  isBot,
  isUrlEncodedForm,
  isMultipartForm,
  createTs
};
