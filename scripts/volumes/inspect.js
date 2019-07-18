const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Promise = require('bluebird');
const MadFakeSlack = 'mad-fake-slack';

const DOCKER_VOLUME_LS = 'docker ps';
async function getRealPath() {
  const { stdout, stderr } = await exec(DOCKER_VOLUME_LS);
  if (stderr) throw new Error(stderr);

  const volumes = stdout.split('\n').map(line => line.split(' ').filter(Boolean)).filter(line => line.length).slice(1);
  const sources = await Promise.mapSeries(volumes, async ([id]) => {
    const { stdout: result } = await exec(`docker inspect -f "{{ json .Mounts }}" ${id}`);
    return result;
  });
  const madFakeSlackData = sources.filter(line => line.indexOf('mad-fake-slack') !== -1);
  if (madFakeSlackData.length) {
    const foundVolumes = JSON.parse(madFakeSlackData[0]).filter(item => item.Source && item.Source.indexOf(MadFakeSlack) !== -1);
    if (foundVolumes.length) {
      return foundVolumes[0].Source;
    }
  }
  throw new Error('Real path to workspace not found');
}

// eslint-disable-next-line no-console
getRealPath().then(path => console.log(path)).catch(() => process.exit(1));
