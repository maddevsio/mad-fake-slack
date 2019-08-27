<div align="center">
    <br>
    <br>
    <img width="360" src="docs/images/logo.png" alt="mad-fake-slack">
    <br>
    <br>
    <p align="center">Your fake service #1!</p>
    <br>
</div>

[![Developed by Mad Devs](https://mdbadge.glitch.me/badge.svg?theme=red-white)](https://maddevs.io)
[![Build Status](https://api.cirrus-ci.com/github/maddevsio/mad-fake-slack.svg)](https://cirrus-ci.com/github/maddevsio/mad-fake-slack)
[![CircleCI](https://circleci.com/gh/maddevsio/mad-fake-slack.svg?style=svg)](https://circleci.com/gh/maddevsio/mad-fake-slack)
[![Build Status](https://travis-ci.org/maddevsio/mad-fake-slack.svg?branch=master)](https://travis-ci.org/maddevsio/mad-fake-slack)

### About project ([`RU`](docs/ABOUT_RU.md))
This project is designed to help test your Slack bots in isolation from the actual Slack service. This approach allows you to run tests on CI and simulate various situations with data in the chat.
The project consists of two parts: user interface and API.
All communication of your bot is carried out through API methods identical to those described in the Slack API documentation. Server side is written in node.js.

### Highlights
* [Demo mad-fake-slack + example bot](https://mad-fake-slack.glitch.me)
* [UI feaures](#the_user_interface_gives_you_the_ability_to)
* [API features](#the-api-gives-you-the-ability-to)
* [For developers](#for-developers-en)
* [Для разработчиков](#%D0%B4%D0%BB%D1%8F-%D1%80%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%87%D0%B8%D0%BA%D0%BE%D0%B2-ru)
* [DOCKER IMAGE | Докер образ](#docker-image--%D0%B4%D0%BE%D0%BA%D0%B5%D1%80-%D0%BE%D0%B1%D1%80%D0%B0%D0%B7)
* [ROADMAP | Путь развития](#roadmap--%D0%BF%D1%83%D1%82%D1%8C-%D1%80%D0%B0%D0%B7%D0%B2%D0%B8%D1%82%D0%B8%D1%8F)

### Demo of interaction with bot from examples folder (Демо взаимодействия с ботом, через UI `mad-fake-slack`)
<div align="center">
    <img src="docs/images/demo.gif" width="560px"/>
</div>

#### The user interface gives you the ability to:
* See current chat situation
* Sending text messages using simple formatting `*bold*`, `~strike~`, ``` `code` ```, ` ```preformatted``` `, `>quote`
* Send messages to different channels, as well as view messages on these channels
* Writing tests using the Gherkin syntax and any library you prefer (cucumber, cucumber.js, etc.). Your tests can interact with the user interface and perform user manipulations to test the functionality of the bot.
* Observe receipt of `user_typing` messages, under the message input field.

#### The API gives you the ability to:
* Using a token for authentication in mad-fake-slack, as in real Slack.
* Sending text messages using simple formatting `*bold*`, `~strike~`, ``` `code` ```, ` ```preformatted``` `, `>quote`
* Request a list of channels with their identifiers
* Sending messages to existing channels via HTTP and RTM
* Receive messages from existing channels (via RTM).
* Receive / send `typing` or `user_typing` messages (via RTM)
* User information request

### Badges
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/blue?icon=dependabot)](https://dependabot.com/)
[![Maintainability](https://api.codeclimate.com/v1/badges/684a8d656c2148c12850/maintainability)](https://codeclimate.com/github/maddevsio/mad-fake-slack/maintainability)
[![dependencies Status](https://david-dm.org/maddevsio/mad-fake-slack.svg)](https://david-dm.org/maddevsio/mad-fake-slack)
[![devDependencies Status](https://david-dm.org/maddevsio/mad-fake-slack/dev-status.svg)](https://david-dm.org/maddevsio/mad-fake-slack?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/maddevsio/mad-fake-slack/badge.svg)](https://snyk.io/test/github/maddevsio/mad-fake-slack)

### For Developers `EN`
* Read [here](docs/FOR_DEVELOPERS_EN.md)

### Для разработчиков `RU`
* Читайте [тут](docs/FOR_DEVELOPERS_RU.md)

### [DOCKER IMAGE | Докер образ](docs/DOCKER.md)
* [EN] coming soon... 
* [RU] скоро будет...

### [ROADMAP | Путь развития](docs/ROADMAP.md) 
* [EN] coming soon... 
* [RU] скоро будет...

### [LICENSE | Лицензия](LICENSE)
