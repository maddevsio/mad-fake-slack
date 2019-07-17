const { WebClient } = require('@slack/web-api');
const { RTMClient } = require('@slack/rtm-api');
const API_CHANNELS_LIST = 'channels.list';

function trackArray(array, check, cb) {
  const arrayChangeHandler = {
    set(target, property, value) {
      // eslint-disable-next-line no-param-reassign
      target[property] = value;
      const isCallbacksValid = typeof check === 'function' && typeof cb === 'function';
      if (isCallbacksValid && check(property, value)) {
        cb(target);
      }
      return true;
    }
  };

  return new Proxy(array, arrayChangeHandler);
}

class FakeUser {
  constructor(token, slackApiUrl) {
    this.token = token;
    this.slackApiUrl = slackApiUrl;
    this.web = null;
    this.rtm = null;
    this.self = null;
    this.team = null;
    this.apiResponses = {};
    this.incomingLastUpdate = null;
    this.rtmIncomingMessages = trackArray(
      [],
      property => property === 'length',
      () => {
        this.incomingLastUpdate = +new Date();
      }
    );
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

  waitForIncomingMessages(numOfTries = 10) {
    return new Promise((resolve, reject) => {
      let counter = 0;
      const prevValue = this.incomingLastUpdate;
      const id = setInterval(() => {
        if (counter >= numOfTries) {
          clearInterval(id);
          reject(new Error(`No changes were found in the message collection after ${numOfTries} tries`));
        }
        if (prevValue !== this.incomingLastUpdate) {
          clearInterval(id);
          resolve(true);
        } else {
          counter += 1;
        }
      }, 100);
    });
  }

  sendTextMessageToChannel(channelName, message) {
    const channel = this.getChannelIdByName(channelName);
    return this.rtm.sendMessage(message, channel.id);
  }

  sendUserTypingToChannel(channelName) {
    const channel = this.getChannelIdByName(channelName);
    return this.rtm.sendTyping(channel.id);
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
