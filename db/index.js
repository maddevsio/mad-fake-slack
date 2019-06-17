const fs = require("fs");
const path = require("path");
const modules = {};
require("fs").readdirSync(__dirname).forEach(function (file) {
  if (file.match(/\.json$/) !== null && file !== "index.js") {
    var name = file.replace(".json", "");
    modules[name] = JSON.parse(fs.readFileSync(path.join(__dirname, file)));
  }
});

function createTs (id) {
  return `${Math.round(+new Date() / 1000)}.${String(id).padStart(6, "0")}`;
}

const messages = require("./messages");
modules["messages"] = messages;

function initMessages (channelId) {
  if (!modules.messages[channelId]) {
    modules.messages[channelId] = {
      meta: {
        last_id: 0
      }
    };
  }
}

modules["manager"] = {
  channel (channelId) {
    return {
      createMessage (userId, message) {
        initMessages(channelId);
        const messages = modules.messages[channelId];
        messages.meta.last_id += 1;
        const id = createTs(messages.meta.last_id);
        messages[id] = {
          type: "message",
          user_id: userId,
          text: message.text,
          ts: id
        };
        return messages[id];
      },
      messages (total) {
        initMessages(channelId);
        return Object
          .values(modules.messages[channelId])
          .slice(1).slice(Number.isInteger(total) ? -total : total).map(m => {
            const user = modules.users.filter(u => u.id === m.user_id)[0];
            const team = modules.teams.filter(t => t.id === user.team_id)[0];
            return {
              ...m,
              user,
              team
            };
          });
      }
    };
  }
};
module.exports = modules;
