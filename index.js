const express = require("express");
const exphbs = require("express-handlebars");
const db = require("./db");

const app = express();
require("express-ws")(app);

const responses = require("./responses");
const port = 9001;
const OPEN = 1;

const slackChannels = db.channels;
const slackTeam = db.teams[0];
const slackUsers = db.users;
const slackUser = db.users[0];

function copyObject (obj) {
  return JSON.parse(JSON.stringify(obj));
}

app.use(express.static("public"));
app.use("/assets", express.static("node_modules"));

app.engine(".hbs", exphbs({
  extname: ".hbs",
  helpers: require("./helpers.js")
}));
app.set("view engine", ".hbs");

app.use("/api/*", express.json());

const slackWss = new Set();
const slackBots = new Set();
const handlers = {
  ping: (ws, msg) => sendJson(ws, {
    "reply_to": msg.id,
    "type": "pong",
    "time": msg.time
  }),
  message: (ws, msg) => sendJson(ws, {
    "reply_to": msg.id,
    "ok": true,
    "channel": msg.channel,
    "ts": String(+new Date() / 1000),
    "message": msg
  })
};

app.ws("/ws", function (ws, req, next) {
  slackBots.add(ws);
  console.warn("new bot connection");

  sendJson(ws, {
    "type": "hello"
  });

  const ignoreMsgTypesUI = new Set(["ping"]);

  ws.on("message", function (msg) {
    console.log("ws msg:", msg);
    const jsonMsg = JSON.parse(msg);
    if (handlers[jsonMsg.type]) {
      handlers[jsonMsg.type](ws, jsonMsg);
    }
    if (!ignoreMsgTypesUI.has(jsonMsg.type)) {
      broadcast(msg);
    }
  });

  ws.on("close", function () {
    slackBots.delete(ws);
  });
});

app.ws("/slack", function (ws, req, next) {
  slackWss.add(ws);
  console.warn("new ui client connection");

  ws.on("message", function (msg) {
    console.log("web msg:", msg);
    broadcastToBots(msg);
    broadcast(msg);
  });

  ws.on("close", function () {
    slackWss.delete(ws);
  });
});

function sendJson (client, msg) {
  if (client.readyState === OPEN) {
    client.send(JSON.stringify(msg));
  }
}

function broadcast (msg) {
  slackWss.forEach((client) => {
    if (client.readyState === OPEN) {
      client.send(msg);
    }
  });
}

function broadcastToBots (msg) {
  slackBots.forEach((client) => {
    if (client.readyState === OPEN) {
      client.send(msg);
    }
  });
}

async function requestTime (req, res, next) {
  console.warn("[i] request: ", req.url, req.method, req.query, req.body);
  req.requestTime = Date.now();
  next();
};

app.use(requestTime);

const MAIN_PAGE = "slackv2";

app.get("/", (req, res) => {
  const selectedChannel = db.channels.filter(ch => ch.name === "general")[0];
  res.render(MAIN_PAGE, {
    selectedChannel,
    selectedUser: null,
    channels: slackChannels,
    users: slackUsers.filter(su => !su.is_bot && !su.is_app_user),
    bots: slackUsers.filter(su => su.is_bot || su.is_app_user),
    team: slackTeam,
    me: slackUser
  });
});

app.get("/messages/:id", (req, res) => {
  const selectedChannel = db.channels.filter(ch => ch.id === req.params.id);
  const selectedUser = db.users.filter(ch => ch.id === req.params.id);
  res.render(MAIN_PAGE, {
    selectedChannel: selectedChannel.length && selectedChannel[0],
    selectedUser: selectedUser.length && selectedUser[0],
    channels: slackChannels,
    users: slackUsers.filter(su => !su.is_bot && !su.is_app_user),
    bots: slackUsers.filter(su => su.is_bot || su.is_app_user),
    team: slackTeam,
    me: slackUser
  });
});

app.post("/api/auth.test", (req, res) => console.warn("auth.test") || res.json(responses["auth.test"]));

app.post("/api/chat.postMessage", async (req, res) => {
  const response = copyObject(responses["chat.postMessage"]);
  response.message = {
    ...response.message,
    ...req.body
  };
  broadcast(JSON.stringify(req.body));
  res.json(response);
});

app.post("/api/channels.list", (req, res) => res.json(responses["channels.list"]));
app.get("/api/rtm.connect", (req, res) => res.json(responses["rtm.connect"]));
app.get("/api/rtm.start", (req, res) => res.json(responses["rtm.connect"]));
app.post("/api/rtm.connect", (req, res) => res.json(responses["rtm.connect"]));
app.post("/api/rtm.start", (req, res) => res.json(responses["rtm.connect"]));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
