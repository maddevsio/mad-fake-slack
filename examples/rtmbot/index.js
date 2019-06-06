const { WebClient, LogLevel } = require("@slack/web-api");
const { RTMClient } = require("@slack/rtm-api");

const BOT_TOKEN = "xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT";

const web = new WebClient(BOT_TOKEN, { slackApiUrl: "http://localhost:9001/api/", logLevel: LogLevel.DEBUG });
const rtm = new RTMClient(BOT_TOKEN, { slackApiUrl: "http://localhost:9001/api/", logLevel: LogLevel.DEBUG });

rtm.start()
  .catch(console.error);

// Calling `rtm.on(eventName, eventHandler)` allows you to handle events (see: https://api.slack.com/events)
// When the connection is active, the 'ready' event will be triggered
rtm.on("ready", async () => {
  const { user_id: userId, user: name } = await web.auth.test();
  console.warn("[i] bot userId:", userId, " and user name ", name);
  const listOfChannels = await web.channels.list({ exclude_archived: 1 });
  const { id } = listOfChannels.channels.filter(({ id, name }) => name === "general");

  const res = await rtm.sendMessage("Hello there! I am a Valera!", id);
  console.warn("[i] Message sent: ", res.ts);
});

rtm.on("message", async (event) => {
  const res = await rtm.sendMessage(`Got it! ${event.text}`, event.channel);
  console.warn("[i] Message sent: ", res.ts);
});

// After the connection is open, your app will start receiving other events.
rtm.on("user_typing", (event) => {
  console.log(event);
});
