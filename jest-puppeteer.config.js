module.exports = {
  launch: {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    executablePath: 'google-chrome-stable'
  },
  server: {
    command: 'npm start',
    port: 9001,
    usedPortAction: 'error',
    launchTimeout: 50000
  },
  browserContext: 'incognito'
};
