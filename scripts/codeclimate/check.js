const util = require('util');
const exec = util.promisify(require('child_process').exec);
const expect = require('expect');
const fs = require('fs');
const chalk = require('chalk');
// eslint-disable-next-line no-console
const log = console.log;
const success = chalk.bold.green;
const error = chalk.bold.red;
const warning = chalk.keyword('orange');

async function isImagesInstalled() {
  const COMMAND = 'docker images | grep codeclimate/';
  const codeClimateImages = [
    'codeclimate/codeclimate-structure',
    'codeclimate/codeclimate-duplication',
    'codeclimate/codeclimate'
  ];
  const { stdout, stderr } = await exec(COMMAND);
  if (!stderr.length > 0) {
    const imageNames = stdout.split('\n').map(line => line.split(' ')[0].trim()).filter(Boolean);
    try {
      expect(imageNames).toStrictEqual(codeClimateImages);
      log(success('[+] All checks passed!'));
    } catch (e) {
      log(warning('You need to pull manually the following images:'), codeClimateImages);
      throw new Error('Needed images not installed manually');
    }
  } else {
    log(error(stderr));
    throw new Error(stderr.toString());
  }
}

async function isInDocker() {
  const DOCKERENV = '/.dockerenv';
  if (!fs.existsSync(DOCKERENV)) throw new Error('Not in Docker');
}

isImagesInstalled()
  .then(isInDocker)
  .then(() => process.exit(0))
  .catch((e) => {
    log(error(e));
    process.exit(1);
  });
