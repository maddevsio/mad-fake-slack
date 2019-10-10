### [EN] List of npm commands 
### [RU] Список команд npm

```
Lifecycle scripts included in mad-fake-slack:
  test
    npm run test:bdd
  start
    node index.js
  pretest
    eslint --ignore-path .gitignore .

available via `npm run-script`:
  test:jest
    jest
  test:bdd
    npm run pretest && npx cucumber-js --fail-fast
  test:bdd:only
    npm run pretest && npx cucumber-js --fail-fast --tags=@only
  example:rtmbot
    SLACK_API=http://localhost:9001/api/ node examples/rtmbot/index.js
  example:rtmbot:bdd
    npm run pretest && SLACK_API=http://0.0.0.0:9001/api/ npm run test:jest -- --runInBand examples/rtmbot/
  lint:hbs
    ember-template-lint views/* views/**/*
  codeclimate:install
    node scripts/codeclimate/check.js && sh scripts/codeclimate/setup.sh
  codeclimate:analyze:format:html
    node scripts/codeclimate/check.js && CODECLIMATE_CODE=$(node scripts/volumes/inspect.js) codeclimate analyze -f html > reports/$(date +"%Y%m%d%H%M%S").html
  codeclimate:analyze:format:json
    node scripts/codeclimate/check.js && CODECLIMATE_CODE=$(node scripts/volumes/inspect.js) codeclimate analyze -f json > reports/$(date +"%Y%m%d%H%M%S").json
  codeclimate:analyze:format:text
    node scripts/codeclimate/check.js && CODECLIMATE_CODE=$(node scripts/volumes/inspect.js) codeclimate analyze -f text > reports/$(date +"%Y%m%d%H%M%S").txt
  codeclimate:analyze
    npm run codeclimate:analyze:format:$REPORT_FORMAT
```
* `test:bdd` - 
  * [EN] Runs bdd test for mad-fake-slack UI 
  * [RU] Запускает интеграционные тесты для mad-fake-slack UI)
* `test:bdd:only` 
  * [EN] As a command above, but runs scripts with a `@only` marker (useful for running a single scenario without specifying long paths) 
  * [RU] Как и предыдущая команда, только запускает сценарии помеченные марером `@only` (Очень полезно, если нужно запустить один или несколько разных сценариев, без необходимости указания длинных путей).
* `example:rtmbot` - 
  * [EN] Runs example of rtm bot 
  * [RU] Запускает пример rtm бота
* `example:rtmbot:bdd` 
  * [EN] Runs bdd tests for rtm bot from `example` folder 
  * [RU] Запускает интеграционные тесты для бота из папки `examples`
* `lint:hbs` 
  * [EN] Runs linter for hbs templates
  * [RU] Запускает линтинг для hbs шаблонов
* `codeclimate:install` 
  * [EN] Installs codeclimate wrapper inside VSCode container
  * [RU] Устанавливает обертку codeclimate в VSCode контейнер
* `codeclimate:analyze:format:html`
  * [EN] Generate codeclimate report in html format after code analysis
  * [RU] Генерирует отчет в формате html после анализа кода
* `codeclimate:analyze:format:json`
  * [EN] Generate codeclimate report in json format after code analysis
  * [RU] Генерирует отчет в формате json после анализа кода
* `codeclimate:analyze:format:text`
  * [EN] Generate codeclimate report in text format after code analysis
  * [RU] Генерирует отчет в формате text после анализа кода
* `codeclimate:analyze`
  * [EN] General command to run code analysis with the ability to set the report format using `REPORT_FORMAT` env variable
  * [RU] Общая команда, позволяющая запустить анализ кода с возможностью указать формат отчета через переменную окружения ]`REPORT_FORMAT`
 

