
const express = require('express');
const router = express.Router();
const { dbManager, wsManager } = require('../managers');
require('express-ws')(router);

function setupMessageHandler(ws, handlers) {
  ws.on('message', (msg) => {
    const jsonMsg = JSON.parse(msg);
    if (handlers[jsonMsg.type]) {
      handlers[jsonMsg.type](ws, jsonMsg);
    }
  });
}

const handlers = {
  ping: (ws, msg) => wsManager.sendJson(ws, {
    reply_to: msg.id,
    type: 'pong',
    time: msg.time
  }),
  message: (ws, msg) => {
    const response = {
      ok: true,
      channel: msg.channel,
      text: msg.text
    };

    if (msg.id !== undefined) {
      response.reply_to = msg.id;
    }

    const message = dbManager.channel(msg.channel).createMessage(ws.user.id, msg);
    message.user = ws.user;
    message.team = ws.team;
    message.channel = msg.channel;
    response.message = message;
    response.ts = message.ts;
    response.channel = message.channel;

    const jsonPayload = JSON.stringify(response.message);

    wsManager.sendJson(ws, response);
    wsManager.broadcast(jsonPayload, ws.user.id);
    wsManager.broadcastToBots(jsonPayload, ws.user.id);
  },
  typing: (ws, msg) => {
    handlers.user_typing(ws, msg);
  },
  user_typing: (ws, msg) => {
    const message = JSON.stringify({
      ...msg,
      channel: msg.channel.id || msg.channel,
      user: ws.user.id
    });
    wsManager.broadcast(message, ws.user.id);
    wsManager.broadcastToBots(message, ws.user.id);
  }
};

router.ws('/ws', (ws, req) => {
  /* eslint-disable no-param-reassign */
  ws.clientType = 'bot';
  const uid = req.query && req.query.uid;
  ws.user = dbManager.users().findById(dbManager.db.sessions[uid])[0];
  ws.team = dbManager.teams().findById(ws.user.team_id)[0];
  /* eslint-enable no-param-reassign */

  wsManager.slackBots.add(ws);

  wsManager.sendJson(ws, {
    type: 'hello'
  });

  setupMessageHandler(ws, handlers);

  ws.on('close', () => {
    wsManager.slackBots.delete(ws);
  });
});

router.ws('/slack', (ws) => {
  /* eslint-disable no-param-reassign */
  ws.clientType = 'ui';
  ws.user = dbManager.slackUser();
  ws.team = dbManager.slackTeam();
  /* eslint-enable no-param-reassign */

  wsManager.slackWss.add(ws);

  setupMessageHandler(ws, handlers);

  ws.on('close', () => {
    wsManager.slackWss.delete(ws);
  });
});

module.exports = router;
