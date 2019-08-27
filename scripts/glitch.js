const fs = require('fs');
const archiver = require('archiver');
const output = fs.createWriteStream(`glitch_release_${+new Date()}.zip`);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

const DomainHost = 'mad-fake-slack.glitch.me';

output.on('close', () => {
  // eslint-disable-next-line no-console
  console.log(`${archive.pointer()} total bytes`);
  // eslint-disable-next-line no-console
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

output.on('end', () => {
  // eslint-disable-next-line no-console
  console.log('Data has been drained');
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    // log warning
    // eslint-disable-next-line no-console
    console.warn(err);
  } else {
    // throw error
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

archive.directory('views/', 'views');
archive.glob('db/**/*', { ignore: ['db/teams.json'] });
archive.directory('public/', 'public');
archive.directory('routes/', 'routes');
archive.file('examples/rtmbot/index.js', { name: 'bot.js' });
archive.file('package-lock.json', { name: 'package-lock.json' });
archive.file('README.md', { name: 'README.md' });
archive.file('server.js', { name: 'server.js' });
archive.file('helpers.js', { name: 'helpers.js' });

const teams = JSON.parse(fs.readFileSync('./db/teams.json', 'utf8'));
teams[0].domain = DomainHost;
teams[0].email_domain = DomainHost;
archive.append(JSON.stringify(teams, ' ', 2), { name: 'db/teams.json' });

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts.start = `URL_SCHEMA=https ${packageJson.scripts.start}`;
archive.append(JSON.stringify(packageJson, ' ', 2), { name: 'package.json' });

archive.finalize();
