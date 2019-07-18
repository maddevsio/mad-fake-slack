const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');

const { dbManager, wsManager } = require('../managers');
const responses = require('../responses');
const utils = require('./utils');
const factories = require('./factories');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  }
});

const upload = multer({ storage });

function beforeAllHandler(req, res, next) {
  if (utils.isUrlEncodedForm(req)) {
    express.urlencoded()(req, res, next);
  } else if (utils.isMultipartForm(req)) {
    upload.none()(req, res, next);
  } else {
    express.json()(req, res, next);
  }
}

function authTestHandler(req, res) {
  const token = (req.body && req.body.token) || req.headers.Authorization;
  const uid = crypto
    .createHash('md5')
    .update(token)
    .digest('hex');

  const users = dbManager.db.users.filter(u => u.id === dbManager.db.sessions[uid]);
  if (!users.length) {
    res.json(responses.invalid_auth);
  } else {
    const user = users[0];
    const team = dbManager.db.teams.filter(tm => tm.id === user.team_id)[0];
    const exampleResponse = responses['auth.test'];
    exampleResponse.team_id = team.id;
    exampleResponse.user_id = user.id;
    res.json(exampleResponse);
  }
}

function createResponse({
  ts, text, channel, user, team
}) {
  return factories.createMessageResponse(
    {
      type: 'message',
      ts,
      text,
      channel
    },
    { user, team }
  );
}

function broadcastResponse({ response, channel, userId }) {
  wsManager.broadcast(JSON.stringify(response.message), userId);
  if (utils.isOpenChannel(channel)) {
    wsManager.broadcastToBots(JSON.stringify(response.message), userId);
  }
  if (utils.isBot(channel, dbManager.db)) {
    wsManager.broadcastToBot(JSON.stringify(response.message), channel);
  }
}

async function postMessageHandler(req, res) {
  const message = dbManager.channel(req.body.channel).createMessage(dbManager.slackUser().id, req.body);
  if (utils.isUrlEncodedForm(req) || utils.isMultipartForm(req)) {
    const channelId = utils.getChannelId(req.body.channel);
    res.redirect(`/messages/${channelId && channelId[0]}`);
  } else {
    const channel = utils.getChannelId(req.body.channel);
    const user = dbManager.slackUser();
    const team = dbManager.slackTeam();
    const response = createResponse({
      user, team, ts: message.ts, channel, text: req.body.text
    });
    broadcastResponse({ response, userId: user.id, channel });
    res.json(response);
  }
}

function rtmConnectHandler(req, res) {
  const token = (req.body && req.body.token) || req.headers.Authorization;
  const tokenHash = crypto
    .createHash('md5')
    .update(token)
    .digest('hex');
  const successResponse = responses['rtm.connect'];

  const response = {
    ...successResponse
  };
  const { id: userId, name: userName } = dbManager.slackUser();
  response.self.id = userId;
  response.self.name = userName;

  const { id: teamId, domain, name: teamName } = dbManager.slackTeam();
  response.team.id = teamId;
  response.team.domain = domain;
  response.team.name = teamName;
  response.url = `${response.url}?uid=${tokenHash}`;
  res.json(response);
}

function channelsListHandler(req, res) {
  const successResponse = {
    ...responses['channels.list']
  };

  successResponse.channels = dbManager.db.channels;
  res.json(successResponse);
}

function conversationsListHandler(req, res) {
  let { types } = req.query;
  const channelTypes = new Set();
  if (!types) {
    types = ['public_channel', 'private_channel'];
  }

  if (Array.isArray(types)) {
    types.forEach(type => channelTypes.add(type));
  } else {
    channelTypes.add(types);
  }

  res.json({ ok: true });
}

function userInfoHandler(req, res) {
  let { user: userId } = req.query;
  const users = dbManager.db.users.filter(u => u.id === userId);
  if (!users.length) {
    res.json(responses.user_not_found);
  } else {
    const user = users[0];
    const response = responses['users.info'];
    res.json({
      ...response,
      user
    });
  }
}

router.use('*', beforeAllHandler);
router.post('/auth.test', authTestHandler);
router.post('/chat.postMessage', postMessageHandler);
router.post('/channels.list', channelsListHandler);
router.get('/rtm.connect', rtmConnectHandler);
router.post('/rtm.connect', rtmConnectHandler);
router.get('/rtm.start', rtmConnectHandler);
router.post('/rtm.start', rtmConnectHandler);
router.get('/users.info', userInfoHandler);
router.get('/conversations.list', conversationsListHandler);

module.exports = router;
