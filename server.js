require('./config/default')();
const fs = require('fs');
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const http = require('http');
const handlebarsHelpers = require('./helpers.js');
const apiRouter = require('./routes/api');
const appRouter = require('./routes/app');
const testApiRouter = require('./routes/testapi');
const rtmRouter = require('./routes/rtm');
const { spawn } = require('child_process');

const port = process.env.PORT;
const host = process.env.HOST;

/* eslint-disable-next-line */
const format =
  ':remote-addr - :remote-user [:date[clf]] ":method '
  + ':url HTTP/:http-version" :type :status :res[content-length] ":referrer" ":user-agent"';
morgan.format('full', format);

const app = express();
require('express-ws')(app);

app.use(express.static('public'));
app.use('/assets', express.static('node_modules'));
app.engine('.hbs', exphbs({ extname: '.hbs', helpers: handlebarsHelpers }));
app.set('view engine', '.hbs');
morgan.token('type', (req) => {
  return req.headers['content-type'];
});
app.use(
  morgan('dev', {
    skip: (_, res) => {
      return res.statusCode < 400 || res.statusCode === 404;
    }
  })
);
app.use(
  morgan('full', {
    stream: fs.createWriteStream(path.join('/tmp', 'access.log'), { flags: 'a' })
  })
);
app.use((req, res, next) => {
  const token = (req.body && req.body.token) || req.headers.Authorization;
  req.token = token;
  req.requestTime = Date.now();
  next();
});

app.use('/', rtmRouter);
app.use('/', appRouter);
app.use('/api/db', testApiRouter);
app.use('/api', apiRouter);

function createUIServer({ httpPort, httpHost }) {
  const server = http.createServer(app);
  let serverPort = httpPort;
  let serverHost = httpHost;
  // eslint-disable-next-line global-require
  require('express-ws')(app, server);
  return {
    start(env) {
      if (env && typeof env === 'object') {
        process.env = {
          ...process.env,
          ...env
        };
        serverPort = process.env.PORT;
        serverHost = process.env.HOST;
      }
      return new Promise(resolve => {
        server.listen(serverPort, serverHost, () => {
          resolve(server);
        });
      });
    },
    close() {
      server.close();
    }
  };
}

if (require.main === module) {
  app.listen(port, host, () => {
    if (fs.existsSync('bot.js')) {
      spawn('npm', ['run', 'example:rtmbot:glitch']);
    }
    /* eslint-disable-next-line */
    console.log(`Example app listening on port ${port}!`);
  });
} else {
  module.exports = createUIServer;
}
