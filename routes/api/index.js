const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');

const { dbManager, wsManager } = require('../managers');
const responses = require('../responses');
const utils = require('./utils');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  }
});

const upload = multer({ storage });

router.use('*', (req, res, next) => {
  if (utils.isUrlEncodedForm(req)) {
    express.urlencoded()(req, res, next);
  } else if (utils.isMultipartForm(req)) {
    upload.none()(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

router.post('/auth.test', (req, res) => {
  const token = (req.body && req.body.token) || req.headers.Authorization;
  const uid = crypto
    .createHash('md5')
    .update(token)
    .digest('hex');
  const user = dbManager.db.users.filter(u => u.id === dbManager.db.sessions[uid])[0];
  const team = dbManager.db.teams.filter(tm => tm.id === user.team_id)[0];
  const exampleResponse = responses['auth.test'];
  exampleResponse.team_id = team.id;
  exampleResponse.user_id = user.id;
  res.json(exampleResponse);
});

router.post('/chat.postMessage', async (req, res) => {
  dbManager.channel(req.body.channel).createMessage(dbManager.slackUser().id, req.body);
  if (utils.isUrlEncodedForm(req) || utils.isMultipartForm(req)) {
    const channelId = utils.getChannelId(req.body.channel);
    res.redirect(`/messages/${channelId && channelId[0]}`);
  } else {
    const response = utils.copyObject(responses['chat.postMessage']);
    response.message = {
      ...response.message,
      ...req.body
    };
    const toChannelId = utils.getChannelId(req.body.channel);
    const currentUserId = dbManager.slackUser().id;

    wsManager.broadcast(JSON.stringify(response.message), currentUserId);
    if (utils.isOpenChannel(toChannelId)) {
      wsManager.broadcastToBots(JSON.stringify(response.message), currentUserId);
    }
    if (utils.isBot(toChannelId, dbManager.db)) {
      wsManager.broadcastToBot(JSON.stringify(response.message), toChannelId);
    }
    res.json(response);
  }
});

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

router.post('/channels.list', (req, res) => {
  const successResponse = {
    ...responses['channels.list']
  };

  successResponse.channels = dbManager.db.channels;
  res.json(successResponse);
});
router.get('/rtm.connect', rtmConnectHandler);
router.post('/rtm.connect', rtmConnectHandler);
router.get('/rtm.start', rtmConnectHandler);
router.post('/rtm.start', rtmConnectHandler);
router.get('/conversations.list', (req, res) => {
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
});

module.exports = router;
