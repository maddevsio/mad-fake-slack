const { WebClient } = require('@slack/web-api');
const { RTMClient } = require('@slack/rtm-api');
const API_CHANNELS_LIST = 'channels.list';

class FakeUser {
  constructor(token, slackApiUrl) {
    this.token = token;
    this.slackApiUrl = slackApiUrl;
    this.web = null;
    this.rtm = null;
    this.self = null;
    this.team = null;
    this.apiResponses = {};
    this.rtmIncomingMessages = [];
  }

  async start() {
    this.web = new WebClient(this.token, { slackApiUrl: this.slackApiUrl });
    this.rtm = new RTMClient(this.token, { slackApiUrl: this.slackApiUrl });
    this.setupEvents();
    const { self, team } = await this.rtm.start();
    this.self = self;
    this.team = team;
    return new Promise(resolve => {
      this.resolveStart = resolve;
    });
  }

  getChannelIdByName(channelName) {
    const result = this.apiResponses[API_CHANNELS_LIST].channels.filter(({ name }) => name === channelName);
    return result.length ? result[0] : null;
  }

  setupEvents() {
    this.rtm.on('ready', async () => {
      const authTestResponse = await this.web.auth.test();
      this.apiResponses['auth.test'] = authTestResponse;
      const channelsListResponse = await this.web.channels.list({ exclude_archived: 1 });
      this.apiResponses['channels.list'] = channelsListResponse;
      if (typeof this.resolveStart === 'function') {
        this.resolveStart();
        delete this.resolveStart;
      }
    });

    this.rtm.on('message', async (event) => {
      this.rtmIncomingMessages.push(event);
    });

    this.rtm.on('user_typing', async (event) => {
      this.rtmIncomingMessages.push(event);
    });
  }

  sendTextMessageToChannel(channelName, message) {
    const id = this.getChannelIdByName(channelName);
    return this.rtm.sendMessage(message, id);
  }

  getLastIncomingPayload(payloadType) {
    const lastItemIndex = this.rtmIncomingMessages.length - 1;
    const index = this.rtmIncomingMessages.slice().reverse().findIndex(m => m.type === payloadType);
    return index >= 0 && this.rtmIncomingMessages[lastItemIndex - index];
  }

  getLastIncomingMessage() {
    return this.getLastIncomingPayload('message');
  }

  getLastIncomingMessageByChannelId(channelId) {
    const filteredMessages = this.getLastIncomingMessagesByChannelId(channelId, 1);
    return filteredMessages[filteredMessages.length - 1];
  }

  getLastIncomingMessagesByChannelId(channelId, limit = 10) {
    const filteredMessages = this.rtmIncomingMessages.filter(msg => msg.channel === channelId);
    return filteredMessages.slice(-1 * limit);
  }

  close() {
    if (this.rtm) {
      this.rtm.removeAllListeners();
      return this.rtm.disconnect();
    }
    return true;
  }
}

module.exports = FakeUser;
