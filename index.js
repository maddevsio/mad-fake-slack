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

function isBot (channel, db) {
  const users = dbManager.db.users.filter(u => u.id === channel && (u.is_app_user || u.is_bot));
  return users.length;
}

const upload = multer({ storage });

const {
  createDbManager
} = require("./db");

const dbManager = createDbManager();

const app = express();
require("express-ws")(app);

const responses = require("./responses");
const port = 9001;
const OPEN = 1;

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

    const message = dbManager.channel(msg.channel).createMessage(ws.user.id, msg);
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
  ws.user = dbManager.db.users.filter(u => u.id === dbManager.db.sessions[uid])[0];
  ws.team = dbManager.db.teams.filter(tm => tm.id === ws.user.team_id)[0];
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
  ws.user = dbManager.slackUser();
  ws.team = dbManager.slackTeam();

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
  const token = (req.body && req.body.token) || req.headers["Authorization"];
  req.token = token;
  console.warn("[i] request: ", req.url, req.method, req.query, req.body);
  req.requestTime = Date.now();
  next();
};

app.use(requestTime);

const MAIN_PAGE = "slackv2";
const MESSAGES_MAX_COUNT = 100;

app.get("/", (req, res) => {
  const selectedChannel = dbManager.db.channels.filter(ch => ch.name === "general")[0];
  const messages = dbManager.channel(selectedChannel.id).messages(MESSAGES_MAX_COUNT);
  res.render(MAIN_PAGE, {
    selectedChannel,
    selectedUser: null,
    selectedApp: null,
    channels: dbManager.db.channels,
    users: dbManager.db.users.filter(su => !su.is_bot && !su.is_app_user),
    bots: dbManager.db.users.filter(su => su.is_bot || su.is_app_user),
    team: dbManager.slackTeam(),
    me: dbManager.slackUser(),
    messages
  });
});

app.get("/messages/:id", (req, res) => {
  const selectedChannel = dbManager.db.channels.filter(ch => ch.id === req.params.id);
  const selectedUser = dbManager.db.users.filter(u => u.id === req.params.id && !u.is_bot && !u.is_app_user);
  const selectedApp = dbManager.db.users.filter(u => u.id === req.params.id && (u.is_bot || u.is_app_user));
  const messages = (selectedChannel.length && dbManager.channel(selectedChannel[0].id).messages(MESSAGES_MAX_COUNT)) ||
      (selectedUser.length && dbManager.channel(selectedUser[0].id).messages(MESSAGES_MAX_COUNT)) ||
      (selectedApp.length && dbManager.channel(selectedApp[0].id).messages(MESSAGES_MAX_COUNT)) ||
      [];
  res.render(MAIN_PAGE, {
    selectedChannel: selectedChannel.length && selectedChannel[0],
    selectedUser: selectedUser.length && selectedUser[0],
    selectedApp: selectedApp.length && selectedApp[0],
    channels: dbManager.db.channels,
    users: dbManager.db.users.filter(su => !su.is_bot && !su.is_app_user),
    bots: dbManager.db.users.filter(su => su.is_bot || su.is_app_user),
    team: dbManager.slackTeam(),
    me: dbManager.slackUser(),
    messages
  });
});

app.post("/api/auth.test", (req, res) => {
  console.warn("auth.test");
  const token = (req.body && req.body.token) || req.headers["Authorization"];
  const uid = crypto.createHash("md5").update(token).digest("hex");
  const user = dbManager.db.users.filter(u => u.id === dbManager.db.sessions[uid])[0];
  const team = dbManager.db.teams.filter(tm => tm.id === user.team_id)[0];
  const exampleResponse = responses["auth.test"];
  exampleResponse.team_id = team.id;
  exampleResponse.user_id = user.id;
  res.json(exampleResponse);
});

app.post("/api/chat.postMessage", async (req, res) => {
  dbManager.channel(req.body.channel).createMessage(dbManager.slackUser().id, req.body);
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
    const currentUserId = dbManager.slackUser().id;

    broadcast(JSON.stringify(response.message), currentUserId);
    if (isOpenChannel(toChannelId)) {
      broadcastToBots(JSON.stringify(response.message), currentUserId);
    }
    if (isBot(toChannelId, dbManager.db)) {
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
  const { id: userId, name: userName } = dbManager.slackUser();
  response.self.id = userId;
  response.self.name = userName;

  const { id: teamId, domain, name: teamName } = dbManager.slackTeam();
  response.team.id = teamId;
  response.team.domain = domain;
  response.team.name = teamName;
  response.url = `${response.url}?uid=${tokenHash}`;
  res.json(response);
}

app.post("/api/channels.list", (req, res) => {
  const successResponse = {
    ...responses["channels.list"]
  };

  successResponse.channels = dbManager.db.channels;
  res.json(successResponse);
});
app.get("/api/rtm.connect", rtmConnectHandler);
app.post("/api/rtm.connect", rtmConnectHandler);
app.get("/api/rtm.start", rtmConnectHandler);
app.post("/api/rtm.start", rtmConnectHandler);
app.get("/test/api/db/reset", (req, res) => {
  dbManager.reset();
  res.json({ ok: true });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
