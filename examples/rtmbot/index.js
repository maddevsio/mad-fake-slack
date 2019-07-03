const { WebClient, LogLevel } = require('@slack/web-api');
const { RTMClient } = require('@slack/rtm-api');

const BOT_TOKEN = 'xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT';
const SLACK_API = process.env.SLACK_API || 'http://localhost:9001/api/';

const web = new WebClient(BOT_TOKEN, { slackApiUrl: SLACK_API, logLevel: LogLevel.DEBUG });
const rtm = new RTMClient(BOT_TOKEN, { slackApiUrl: SLACK_API, logLevel: LogLevel.DEBUG });

// Calling `rtm.on(eventName, eventHandler)` allows you to handle events (see: https://api.slack.com/events)
// When the connection is active, the 'ready' event will be triggered
let botUserId = null;

rtm.on('ready', async () => {
  const { user_id: userId, user: userName } = await web.auth.test();
  botUserId = userId;
  // eslint-disable-next-line no-console
  console.warn('[i] bot userId:', userId, ' and user name ', userName);
  const listOfChannels = await web.channels.list({ exclude_archived: 1 });
  const { id } = listOfChannels.channels.filter(({ name }) => name === 'general')[0];
  // eslint-disable-next-line no-console
  console.warn('Channnel ID: ', id);
  const res = await rtm.sendMessage('Hello there! I am a Valera!', id);
  // eslint-disable-next-line no-console
  console.warn('[i] Message sent: ', res.ts);
});

rtm.on('message', async (event) => {
  const res = await rtm.sendMessage(
    `You sent text to ${botUserId === event.channel
      ? 'me (direct)'
      : 'the channel'}: ${event.text}`, event.channel
  );
  // eslint-disable-next-line no-console
  console.warn('[i] Message sent: ', res.ts);
});

// After the connection is open, your app will start receiving other events.
rtm.on('user_typing', (event) => {
  // eslint-disable-next-line no-console
  console.log(event);
});

rtm.start()
  // eslint-disable-next-line no-console
  .catch(console.error);
