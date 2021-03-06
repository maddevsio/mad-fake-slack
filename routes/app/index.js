const express = require('express');
const router = express.Router();
const { dbManager } = require('../managers');

const constants = require('../constants');

router.get('/', (req, res) => {
  const selectedChannel = dbManager.db.channels.filter(ch => ch.name === 'general')[0];
  const messages = dbManager.channel(selectedChannel.id).messages(constants.MESSAGES_MAX_COUNT);
  res.render(constants.MAIN_PAGE, {
    selectedChannel,
    selectedUser: null,
    selectedApp: null,
    channels: dbManager.db.channels,
    users: dbManager.db.users.filter(su => !su.is_bot && !su.is_app_user),
    bots: dbManager.db.users.filter(su => su.is_bot || su.is_app_user),
    team: dbManager.slackTeam(),
    me: dbManager.slackUser(),
    messages,
    constants
  });
});

router.get('/messages/:id', (req, res) => {
  const selectedChannel = dbManager.db.channels.filter(ch => ch.id === req.params.id);
  const selectedUser = dbManager.users().findById(req.params.id, u => !u.is_bot && !u.is_app_user);
  const selectedApp = dbManager.users().findById(req.params.id, u => u.is_bot || u.is_app_user);
  const messages = (selectedChannel.length && dbManager.channel(selectedChannel[0].id).messages(constants.MESSAGES_MAX_COUNT))
    || (selectedUser.length && dbManager.channel(selectedUser[0].id).messages(constants.MESSAGES_MAX_COUNT))
    || (selectedApp.length && dbManager.channel(selectedApp[0].id).messages(constants.MESSAGES_MAX_COUNT))
    || [];
  res.render(constants.MAIN_PAGE, {
    selectedChannel: selectedChannel.length && selectedChannel[0],
    selectedUser: selectedUser.length && selectedUser[0],
    selectedApp: selectedApp.length && selectedApp[0],
    channels: dbManager.db.channels,
    users: dbManager.db.users.filter(su => !su.is_bot && !su.is_app_user),
    bots: dbManager.db.users.filter(su => su.is_bot || su.is_app_user),
    team: dbManager.slackTeam(),
    me: dbManager.slackUser(),
    messages,
    constants
  });
});

module.exports = router;
