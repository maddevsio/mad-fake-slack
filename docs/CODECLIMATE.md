## `EN`
### Code Climate local setup
* You must download the following images one by one to your host system:
  * `docker pull codeclimate/codeclimate-structure` size `~ 1.9 Gb` of network traffic
  * `docker pull codeclimate/codeclimate-duplication` size `~ 100 - 200 Mb` of network traffic
  * `docker pull codeclimate/codeclimate` size `~ 100 - 200 Mb` of network traffic
    * **ATTANTION!!!** After uncompressing `codeclimate/codeclimate-structure` and `codeclimate/codeclimate-duplication` will use `10 Gb` of your disk space.
* After that, you mast open your `VSCode` in `Remote-Container` using command `Remote-Containers: Open Folder in Container` of commands explorer.
* Inside VSCode terminal execute the following commands:
    * `npm run codeclimate:install` - this command checks presence of docker images and installs codeclimate wrapper to your VSCode docker container.

### Code Climate project analyze
* For running codeclimate analysis, you must choose one of three report formats (`html`, `json`, `text`) and execute one of the following commands in the VSCode terminal:
    * `REPORT_FORMAT=html npm run codeclimate:analyze` - **html** fromat - a more comfortable way for visual analysis of results in browser
    * `REPORT_FORMAT=json npm run codeclimate:analyze` - **json** format - for analysis using any your tools
    * `REPORT_FORMAT=json npm run codeclimate:analyze` - **text** format - a simple way to view results without any special viewers
        * **IMPORTANT** - all reports will be stored in the `reports` folder, and each file has the following name format `%Y%m%d%H%M%S`.`(html|json|text)`

## `RU`
### Code Climate локальная установка
* Вы должны скачать следующие образы, по одному, в вашу хост-систему (в порядке очередности):
  * `docker pull codeclimate/codeclimate-structure` размер `~ 1.9 Gb` сетевого трафика
  * `docker pull codeclimate/codeclimate-duplication` рвзмер `~ 100 - 200 Mb` сетевого трафика
  * `docker pull codeclimate/codeclimate` размер `~ 100 - 200 Mb` сетевого трафика
    * **ВНИМАНИЕ!!!** После распаковки `codeclimate/codeclimate-structure` и `codeclimate/codeclimate-duplication` будут вместе занимать `10 Gb` вашего дискового пространства.
* Далее, нужно открыть текущий проект в `VSCode` и `Remote-Container` набрав команду `Remote-Containers: Open Folder in Container` в эксплорере команд.
* Затем выполните команду:
    * `npm run codeclimate:install` - эта команда проверяет наличие необходимых образов в системе, затем устанавливает враппер `codeclimate`, в контейнер `VSCode`.

### Code Climate анализ проекта
* Для запуска анализа кода через codeclimate, внутри контейнера VSCode, вам нужно определиться с одним из форматов отчета (`html`, `json`, `text`) и выполнить одну из следующих команд, в терминале VSCode:
    * `REPORT_FORMAT=html npm run codeclimate:analyze` - **html** формат - наиболее кофортный для визуального анализа через браузер
    * `REPORT_FORMAT=json npm run codeclimate:analyze` - **json** формат - удобен для использования результатов вашими инструментами, которые делают выводы о качестве кода.
    * `REPORT_FORMAT=json npm run codeclimate:analyze` - **text** формат - простейший вид отчета, который можно просмотреть на сервере и любом текстовом редакторе на клиенте.
        * **ВАЖНО** - все отчеты складируются в папке `reports` в корне проекта и в качестве имени указана текущая дата в формате `%Y%m%d%H%M%S`.`(html|json|text)`