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

  static sendByCondition(clients, msg, conditionFn = () => false) {
    clients.forEach(client => {
      if (client.readyState === OPEN && conditionFn(client)) {
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

  broadcastToBot(msg, botId) {
    WsManager.sendByCondition(this.slackBots, msg, client => client.user.id === botId);
  }

  broadcast(msg, except) {
    WsManager.sendByCondition(this.slackWss, msg, client => client.user.id !== except);
  }

  broadcastToBots(msg, except) {
    WsManager.sendByCondition(this.slackBots, msg, client => client.user.id !== except);
  }
}

const dbManager = createDbManager();
const wsManager = new WsManager();

module.exports = {
  dbManager,
  wsManager
};
