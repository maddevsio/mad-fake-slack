const fs = require("fs");
const path = require("path");
const modules = {};
require("fs").readdirSync(__dirname).forEach(function (file) {
  if (file.match(/\.json$/) !== null && file !== "index.js") {
    var name = file.replace(".json", "");
    modules[name] = JSON.parse(fs.readFileSync(path.join(__dirname, file)));
  }
});

const messages = require("./messages");
modules["messages"] = messages;
modules["manager"] = {
  channel (channelId) {
    return {
      messages (total) {
        return Object
          .values(modules.messages[channelId])
          .slice(1, Number.isInteger(total) ? total + 1 : total).map(m => {
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
