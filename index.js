const express = require("express");
const exphbs = require("express-handlebars");
const multer = require("multer");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`);
  }
});

function isUrlEncodedForm (req) {
  return req.headers["content-type"] === ("application/x-www-form-urlencoded");
}

function isMultipartForm (req) {
  return req.headers["content-type"].startsWith("multipart/form-data");
}

function copyObject (obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getChannelId (channel) {
  const result = /^[CWDU][A-Z0-9]{8}$/.exec(channel);
  return (Array.isArray(result) && result[0]) || null;
}

function isOpenChannel (channel) {
  return channel && channel.startsWith("C");
}

function isBot (channel) {
  const users = db.users.filter(u => u.id === channel && (u.is_app_user || u.is_bot));
  return users.length;
}

const upload = multer({ storage });

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

app.use(express.static("public"));
app.use("/assets", express.static("node_modules"));

app.engine(".hbs", exphbs({
  extname: ".hbs",
  helpers: require("./helpers.js")
}));
app.set("view engine", ".hbs");

app.use("/api/*", (req, res, next) => {
  if (isUrlEncodedForm(req)) {
    express.urlencoded()(req, res, next);
  } else if (isMultipartForm(req)) {
    upload.none()(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

const slackWss = new Set();
const slackBots = new Set();
const deleteActions = {};
deleteActions["bot"] = function (client) {
  slackBots.delete(client);
};
deleteActions["ui"] = function (client) {
  slackWss.delete(client);
};

const handlers = {
  ping: (ws, msg) => sendJson(ws, {
    "reply_to": msg.id,
    "type": "pong",
    "time": msg.time
  }),
  message: (ws, msg) => {
    const response = {
      "ok": true,
      "channel": msg.channel,
      "text": msg.text
    };

    if (msg.id !== undefined) {
      response["reply_to"] = msg.id;
    }

    const message = db.manager.channel(msg.channel).createMessage(ws.user.id, msg);
    message.user = ws.user;
    message.team = ws.team;
    message.channel = msg.channel;
    response.message = message;
    response.ts = message.ts;
    response.channel = message.channel;

    sendJson(ws, response);
    broadcast(JSON.stringify(response.message), ws.user.id);
    broadcastToBots(JSON.stringify(response.message), ws.user.id);
  }
};

app.ws("/ws", function (ws, req, next) {
  ws.clientType = "bot";
  const uid = req.query && req.query.uid;
  ws.user = db.users.filter(u => u.id === db.sessions[uid])[0];
  ws.team = db.teams.filter(tm => tm.id === ws.user.team_id)[0];
  slackBots.add(ws);

  sendJson(ws, {
    "type": "hello"
  });

  ws.on("message", function (msg) {
    console.log("ws msg:", msg);
    const jsonMsg = JSON.parse(msg);
    if (handlers[jsonMsg.type]) {
      handlers[jsonMsg.type](ws, jsonMsg);
    }
  });

  ws.on("close", function () {
    slackBots.delete(ws);
  });
});

app.ws("/slack", function (ws, req, next) {
  ws.clientType = "ui";
  ws.user = slackUser;
  ws.team = slackTeam;

  slackWss.add(ws);
  console.warn("new ui client connection");

  ws.on("message", function (msg) {
    console.log("web msg:", msg);
    const jsonMsg = JSON.parse(msg);
    if (handlers[jsonMsg.type]) {
      handlers[jsonMsg.type](ws, jsonMsg);
    }
  });

  ws.on("close", function () {
    slackWss.delete(ws);
  });
});

function sendJson (client, msg) {
  if (client.readyState === OPEN) {
    client.send(JSON.stringify(msg));
  } else {
    deleteActions[client.clientType](client);
  }
}

function broadcast (msg, except) {
  slackWss.forEach((client) => {
    if (client.readyState === OPEN && client.user.id !== except) {
      client.send(msg);
    }
  });
}

function broadcastToBots (msg, except) {
  slackBots.forEach((client) => {
    if (client.readyState === OPEN && client.user.id !== except) {
      client.send(msg);
    }
  });
}

function broadcastToBot (msg, botId) {
  slackBots.forEach((client) => {
    if (client.readyState === OPEN && client.user.id === botId) {
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
const MESSAGES_MAX_COUNT = 100;

app.get("/", (req, res) => {
  const selectedChannel = db.channels.filter(ch => ch.name === "general")[0];
  const messages = db.manager.channel(selectedChannel.id).messages(MESSAGES_MAX_COUNT);
  res.render(MAIN_PAGE, {
    selectedChannel,
    selectedUser: null,
    selectedApp: null,
    channels: slackChannels,
    users: slackUsers.filter(su => !su.is_bot && !su.is_app_user),
    bots: slackUsers.filter(su => su.is_bot || su.is_app_user),
    team: slackTeam,
    me: slackUser,
    messages
  });
});

app.get("/messages/:id", (req, res) => {
  const selectedChannel = db.channels.filter(ch => ch.id === req.params.id);
  const selectedUser = db.users.filter(u => u.id === req.params.id && !u.is_bot && !u.is_app_user);
  const selectedApp = db.users.filter(u => u.id === req.params.id && (u.is_bot || u.is_app_user));
  const messages = (selectedChannel.length && db.manager.channel(selectedChannel[0].id).messages(MESSAGES_MAX_COUNT)) ||
      (selectedUser.length && db.manager.channel(selectedUser[0].id).messages(MESSAGES_MAX_COUNT)) ||
      (selectedApp.length && db.manager.channel(selectedApp[0].id).messages(MESSAGES_MAX_COUNT)) ||
      [];
  res.render(MAIN_PAGE, {
    selectedChannel: selectedChannel.length && selectedChannel[0],
    selectedUser: selectedUser.length && selectedUser[0],
    selectedApp: selectedApp.length && selectedApp[0],
    channels: slackChannels,
    users: slackUsers.filter(su => !su.is_bot && !su.is_app_user),
    bots: slackUsers.filter(su => su.is_bot || su.is_app_user),
    team: slackTeam,
    me: slackUser,
    messages
  });
});

app.post("/api/auth.test", (req, res) => {
  console.warn("auth.test");
  const token = (req.body && req.body.token) || req.headers["Authorization"];
  const uid = crypto.createHash("md5").update(token).digest("hex");
  const user = db.users.filter(u => u.id === db.sessions[uid])[0];
  const team = db.teams.filter(tm => tm.id === user.team_id)[0];
  const exampleResponse = responses["auth.test"];
  exampleResponse.team_id = team.id;
  exampleResponse.user_id = user.id;
  res.json(exampleResponse);
});

app.post("/api/chat.postMessage", async (req, res) => {
  db.manager.channel(req.body.channel).createMessage(slackUser.id, req.body);
  if (isUrlEncodedForm(req) || isMultipartForm(req)) {
    const channelId = getChannelId(req.body.channel);
    res.redirect(`/messages/${channelId && channelId[0]}`);
  } else {
    const response = copyObject(responses["chat.postMessage"]);
    response.message = {
      ...response.message,
      ...req.body
    };
    const toChannelId = getChannelId(req.body.channel);

    broadcast(JSON.stringify(response.message), slackUser.id);
    if (isOpenChannel(toChannelId)) {
      broadcastToBots(JSON.stringify(response.message), slackUser.id);
    }
    if (isBot(toChannelId)) {
      broadcastToBot(JSON.stringify(response.message), toChannelId);
    }
    res.json(response);
  }
});

function rtmConnectHandler (req, res) {
  const token = (req.body && req.body.token) || req.headers["Authorization"];
  const tokenHash = crypto.createHash("md5").update(token).digest("hex");
  const successResponse = responses["rtm.connect"];

  const response = {
    ...successResponse
  };
  response.self.id = slackUser.id;
  response.self.name = slackUser.name;

  response.team.id = slackTeam.id;
  response.team.domain = slackTeam.domain;
  response.team.name = slackTeam.name;
  response.url = `${response.url}?uid=${tokenHash}`;
  res.json(response);
}

app.post("/api/channels.list", (req, res) => {
  const successResponse = {
    ...responses["channels.list"]
  };

  successResponse.channels = db.channels;
  res.json(successResponse);
});
app.get("/api/rtm.connect", rtmConnectHandler);
app.post("/api/rtm.connect", rtmConnectHandler);
app.get("/api/rtm.start", rtmConnectHandler);
app.post("/api/rtm.start", rtmConnectHandler);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
