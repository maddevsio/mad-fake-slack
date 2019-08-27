# The purpose of this project
* Helps to test your bot or application without using a real `Slack` server. It is also useful for writing integration and `e2e` tests.

### How to setup a project locally for development (VSCode are used to develop the project.)
* In order to set up the working environment you need:
    * `Docker` application for your OS, you can download here https://docs.docker.com/install/
* Clone this project to your favorite location using command (for example):
    * `git clone https://github.com/maddevsio/mad-fake-slack.git`
* Next, you need to install `VSCode`
    * Here are 3 quick steps to get started doing Visual Studio Code Remote Development:
        * Install the [stable version of VSCode](https://code.visualstudio.com)
        * Get the [Remote Development Extension Pack](https://aka.ms/VSCodeRemoteExtensionPack), which installs support for WSL, SSH, and Containers and is the easiest way to get started. If you don't need them all, you can uninstall the individual extensions.
        * Read the [Docs](https://aka.ms/vscode-remote). Try the [Dev Container samples](https://github.com/search?q=org%3AMicrosoft+vscode-remote-try-&unscoped_q=vscode-remote-try-).
    * Next you need to open the project in `VSCode`
    * Watch [Remote-Containers](https://youtu.be/TVcoGLL6Smo) on YouTube
    * `Reopen in Container` popup message will appear.
    * `VSCode` restarts and begins to create and configure containers. (Check that Docker service has been started)
    * Then you can open VSCode terminal, which, if everything is successful, will be connnected to the docker container for development, with all necessary tools installed in it. You will see a greeting like `root@e6e415dc0d02: /workspace` or `#/`in the case of `/bin/sh`.
    * Now you can work on project.`VSCode` is connected to the environment in the docker.

### Proof of work
* In the current terminal VSCode, execute the command `npm start`
* After that go to the URL `http://localhost:9001` in the browser (The current simple Fake Slak interface will be displayed)
* To demonstrate, you need to open another remote terminal VSCode and execute the command `npm run example:rtmbot` (This command will run simple client bot application)
* Then you will see in `UI` at the address `http://localhost:9001` a message from the bot. If you type a message and send it to the bot (using Enter or the "Send" button, you will receive an answer, with your message back).

### How to run example of integration tests between bot (from examples folder) and mad-fake-slack
* For executing integration tests was used `jest-puppeeter`.
    * `jest` used as platform for writing tests in consolidation with power of `puppeeter`
* You need to run command inside VSCode console `npm run example:rtmbot:integration`

### Testing api
* Now supported following test api methods:
  * `GET` `/api/db/reset` - resets current db (If you will refresh mad-fake-slack ui in your browser, you will see that your conversational data has disappeared)
  * `GET` `/api/db/current/team?domain=NEW_DOMAIN_VALUE` - Sets the domain value for the current team (by default, value for `team.domain` equal to `localhost:9001`). Affects the domain for the URL when constructing a websocket url and workspace url.

### [List of NPM commands](NPMCOMMANDS.md)
### [Local setup and running code analysis using Code Climate](CODECLIMATE.md)