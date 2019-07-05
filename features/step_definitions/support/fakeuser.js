const { WebClient, LogLevel } = require('@slack/web-api');
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
    this.web = new WebClient(this.token, { slackApiUrl: this.slackApiUrl, logLevel: LogLevel.DEBUG });
    this.rtm = new RTMClient(this.token, { slackApiUrl: this.slackApiUrl, logLevel: LogLevel.DEBUG });
    this.setupEvents();
    const { self, team } = await this.rtm.start();
    this.self = self;
    this.team = team;
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

  async close() {
    this.rtm.removeAllListeners();
    return this.rtm.disconnect();
  }
}

module.exports = FakeUser;
