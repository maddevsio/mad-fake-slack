const responses = require('../responses');
const utils = require('./utils');
const faker = require('faker');
let generationId = 1;
let eventIdTracker = 1;

function createMessageResponse({
  type,
  ts,
  text,
  channel
}, { user, team }) {
  const response = utils.copyObject(responses['chat.postMessage']);
  const msgTs = typeof ts === 'undefined' ? utils.createTs(generationId) : ts;
  generationId += 1;
  response.ts = msgTs;
  response.channel = channel;

  const overrideProperties = {
    client_msg_id: faker.random.uuid(),
    text,
    type,
    user: user.id,
    team: team.id,
    user_team: team.id,
    source_team: team.id,
    channel,
    event_ts: msgTs,
    ts: msgTs
  };

  response.message = {
    ...response.message,
    ...overrideProperties
  };
  return response;
}

function createUpdateMessageEvent({ channel, message, previousMessage }, { user, team }) {
  const eventTs = utils.createTs(eventIdTracker);
  eventIdTracker += 1;
  const clientMsgId = faker.random.uuid();

  const overrideMessageProps = {
    client_msg_id: clientMsgId,
    type: 'message',
    user: user.id,
    team: team.id,
    edited: { user: user.id, ts: eventTs },
    user_team: team.id,
    source_team: team.id,
    channel
  };

  const overridePevMessageProps = {
    client_msg_id: clientMsgId,
    type: 'message',
    user: user.id,
    team: team.id
  };

  const messagePayload = {
    ...utils.copyObject(message),
    ...overrideMessageProps
  };

  const previousMessagePayload = {
    ...utils.copyObject(previousMessage),
    ...overridePevMessageProps
  };

  ['user_id'].forEach(unwantedProp => {
    delete messagePayload[unwantedProp];
    delete previousMessagePayload[unwantedProp];
  });

  return {
    type: 'message',
    subtype: 'message_changed',
    hidden: false,
    message: messagePayload,
    channel,
    previous_message: previousMessagePayload,
    event_ts: eventTs,
    ts: eventTs
  };
}

module.exports = {
  createMessageResponse,
  createUpdateMessageEvent
};
