# mad-fake-slack

# `RU`

# Цель данного проекта
* Помочь в тестировании вашего бота или приложения, без использования реального сервера Slack. Пригодится так же для написания интеграционных и e2e тестов.

### Как поднять проект локально для разработки (Разработка ведется в VSCode-insiders)
* Для того чтобы поднять рабочее окружение тебе понадобится:
  * `Docker` приложение для твоей ОС скачать можно тут https://docs.docker.com/install/
* Далее необходимо установить `VSCode insider` (на данный момент только в нем есть поддержка Remote-Docker)
  * Как установить смотри [тут](https://code.visualstudio.com/blogs/2019/05/02/remote-development)
  * Вот 3 быстрых шага, чтобы начать делать удаленную разработку кода Visual Studio
    * Установите [инсайдерскую сборку](https://code.visualstudio.com/insiders/). Это понадобится вам для удаленной разработки, пока она не станет доступна в стабильной версии. Инсайдерские сборки выходят ежедневно с последними функциями и исправлениями ошибок. Если вы беспокоитесь о стабильности, не беспокойтесь! Мы используем сборки Insiders для разработки VS Code, и он может быть установлен рядом со стабильным в случае, если что-то сломается ([и дайте нам знать](https://github.com/Microsoft/vscode/issues/new)).
    * Получите [пакет расширений для удаленной разработки](https://aka.ms/VSCodeRemoteExtensionPack), (Если code-insider у вас не по умолчанию, то лучше установить Remote Development расширение через поиск во вкладки с расширениями), который устанавливает поддержку WSL, SSH и контейнеров и является самым простым способом начать работу. Если они вам не нужны, вы можете удалить отдельные расширения.
    * Прочитайте [документы](https://aka.ms/vscode-remote). Попробуйте [образцы Dev Container](https://github.com/search?q=org%3AMicrosoft+vscode-remote-try-&unscoped_q=vscode-remote-try-).
* Далее нужно открыть проект в code-insiders
* Посмотрите [видео по Remote-Containers](https://youtu.be/TVcoGLL6Smo) на Ютубе 
* Появится всплывающее сообщение "Reopen in Container"
* VSCode перезагрузится и начнет поднимать контейнеры (Убедитесь что сервис докера запущен)
* Далее можно вызвать терминал VSCode, который если все будет успешно, будет привязан к докеру для разработки, c установленными в нем всем необходимым. Вы увидите приветсвие типа `root@e6e415dc0d02:/workspace` или `#/`в случае `/bin/sh`
* Теперь можно разрабатывать, рабочее окружение поднято в докере и VSCode подключен к окружению в докере

### Демонстрация работы
* Далее в текущем терминале VSCode-insiders, выполнить команду `npm start`
* И в браузере перейти по URL `http://localhost:9001` (Будет отображен текущий простой интерфейс Фейк-Слака)
* Для демонстрации, нужно открыть еще один удаленный терминал VSCode-insiders и выполнить команду `npm run example:rtmbot`
* Далее вы увидите в `UI` по адресу `http://localhost:9001` сообщение от бота. Если вы наберете сообщение и отправите его боту (используя Enter или кнопку "Отправить", то получите ответ, с вашим сообщением обратно).

# `EN`

# The purpose of this project
* Help to test your bot or application without using a real Slack server. It is also useful for writing integration and e2e tests.

### How to setup a project locally for development (VSCode insiders are used to develop the project.)
* In order to set up the working environment you need:
    * `Docker` application for your OS, you can download here https://docs.docker.com/install/
* Next, you need to install `VSCode-insiders` (at the moment only this version has support for Remote-Docker)
    * How to install see [here](https://code.visualstudio.com/blogs/2019/05/02/remote-development)
    * Here are 3 quick steps to get started doing Visual Studio Code Remote Development:
        * Install the [Insiders](https://code.visualstudio.com/insiders/) build. You'll need this for remote development until it is available in Stable. The Insiders build ships daily with the latest features and bug fixes. If you are concerned about stability, don't be! We use the Insiders builds to develop VS Code and it can be installed side by side with Stable in case something does break ([and let us know](https://github.com/Microsoft/vscode/issues/new)).
        * Get the [Remote Development Extension Pack](https://aka.ms/VSCodeRemoteExtensionPack), which installs support for WSL, SSH, and Containers and is the easiest way to get started. If you don't need them all, you can uninstall the individual extensions.
        * Read the [Docs](https://aka.ms/vscode-remote). Try the [Dev Container samples](https://github.com/search?q=org%3AMicrosoft+vscode-remote-try-&unscoped_q=vscode-remote-try-).
    * Next you need to open the project in code-insiders
    * Watch [Remote-Containers](https://youtu.be/TVcoGLL6Smo) on YouTube
    * `Reopen in Container` popup message will appear.
    * VSCode restarts and begins to create and configure containers. (Check that Docker service has been started)
    * Then you can open VSCode terminal, which, if everything is successful, will be connnected to the docker container for development, with all necessary tools installed in it. You will see a greeting like `root@e6e415dc0d02: /workspace` or `#/`in the case of `/bin/sh`.
    * Now you can work on project.`VSCode-insiders` is connected to the environment in the docker.

### Proof of work
* In the current terminal VSCode insiders, execute the command `npm start`
* After that go to the URL `http://localhost:9001` in the browser (The current simple Fake Slak interface will be displayed)
* To demonstrate, you need to open another remote terminal VSCode-insiders and execute the command `npm run example:rtmbot` (This command will run simple client bot application)
* Then you will see in `UI` at the address `http://localhost:9001` a message from the bot. If you type a message and send it to the bot (using Enter or the "Send" button, you will receive an answer, with your message back).
