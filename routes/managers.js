const { createDbManager } = require('../db');
const { OPEN } = require('./constants');

class WsManager {
  constructor() {
    this.slackWss = new Set();
    this.slackBots = new Set();
    this.deleteActions = {};

    this.deleteActions.bot = (client) => {
      this.slackBots.delete(client);
    };
    this.deleteActions.ui = (client) => {
      this.slackWss.delete(client);
    };
  }

  broadcastToBot(msg, botId) {
    this.slackBots.forEach(client => {
      if (client.readyState === OPEN && client.user.id === botId) {
        client.send(msg);
      }
    });
  }

  sendJson(client, msg) {
    if (client.readyState === OPEN) {
      client.send(JSON.stringify(msg));
    } else {
      this.deleteActions[client.clientType](client);
    }
  }

  broadcast(msg, except) {
    this.slackWss.forEach(client => {
      if (client.readyState === OPEN && client.user.id !== except) {
        client.send(msg);
      }
    });
  }

  broadcastToBots(msg, except) {
    this.slackBots.forEach(client => {
      if (client.readyState === OPEN && client.user.id !== except) {
        client.send(msg);
      }
    });
  }
}

const dbManager = createDbManager();
const wsManager = new WsManager();

module.exports = {
  dbManager,
  wsManager
};
