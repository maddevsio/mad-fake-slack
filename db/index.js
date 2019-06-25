const fs = require("fs");
const path = require("path");

class DbReader {
  constructor (dirname) {
    this.dirname = dirname;
  }

  _makeCopy (data) {
    return JSON.parse(JSON.stringify(data));
  }

  read () {
    const db = {};
    fs.readdirSync(this.dirname).forEach((file) => {
      if (file.match(/\.json$/) !== null && file !== "index.js") {
        var name = file.replace(".json", "");
        db[name] = JSON.parse(fs.readFileSync(path.join(this.dirname, file)));
      }
    });
    const messages = require("./messages");
    db["messages"] = messages;
    return this._makeCopy(db);
  }
}

class DbManager {
  constructor (dbReader) {
    this.db = null;
    this.dbReader = dbReader;
    this._initDb();
  }

  _initDb () {
    if (!this.db) {
      this.db = this.dbReader.read();
    } else {
      throw new Error("DbManager: Database already initialized");
    }
  }

  _checkIsDbInitialized () {
    if (!this.db) throw new Error("DbManager: Database not initialized! Please call `initDb() method`");
  }

  _initMessages (channelId) {
    if (!this.db.messages[channelId]) {
      this.db.messages[channelId] = {
        meta: {
          last_id: 0
        }
      };
    }
  }

  reset () {
    this.db = null;
    this._initDb();
  }

  createTs (id) {
    return `${Math.round(+new Date() / 1000)}.${String(id).padStart(6, "0")}`;
  }

  slackUser () {
    this._checkIsDbInitialized();
    return this.db.users[0];
  }

  slackTeam () {
    this._checkIsDbInitialized();
    return this.db.teams.filter(t => t.id === this.slackUser().team_id)[0];
  }

  channel (channelId) {
    this._checkIsDbInitialized();
    return {
      createMessage: (userId, message) => {
        this._initMessages(channelId);
        const messages = this.db.messages[channelId];
        messages.meta.last_id += 1;
        const id = this.createTs(messages.meta.last_id);
        messages[id] = {
          type: "message",
          user_id: userId,
          text: message.text,
          ts: id
        };
        return messages[id];
      },
      messages: (total) => {
        this._initMessages(channelId);
        return Object
          .values(this.db.messages[channelId])
          .slice(1).slice(Number.isInteger(total) ? -total : total).map(m => {
            const user = this.db.users.filter(u => u.id === m.user_id)[0];
            const team = this.db.teams.filter(t => t.id === user.team_id)[0];
            return {
              ...m,
              user,
              team
            };
          });
      }
    };
  }
}

function createDbManager () {
  return new DbManager(new DbReader(__dirname));
}

module.exports = {
  DbManager,
  DbReader,
  createDbManager
};
