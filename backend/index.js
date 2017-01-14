'use strict';

var fs = require('fs');
var path = require('path');
var http = require('http');
var express = require('express');
var colors = require('colors/safe');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('../webpack.config.js');

const isDevelopment = process.env.NODE_ENV !== 'production';
console.log(`running in ${isDevelopment ? colors.red('development') : colors.green('production')} mode`);

const rootDir = path.resolve(path.dirname(__dirname));
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(rootDir, 'backend', 'views'));

const staticAssets = {
  // Static files (no build step) are served at /assets.
  '/assets': {
    localPath: 'assets'
  },
  // Built files (transpiled js, minified css, etc) are served at /build.
  '/build': {
    localPath: 'build',
    enabled: !isDevelopment  // served by webpack-middleware
  },
  // Source frontend files are served at /src.
  '/src': {
    localPath: 'src',
    enabled: isDevelopment
  }
};
Object.keys(staticAssets).forEach(function (urlPath) {
  const options = staticAssets[urlPath];
  if ('enabled' in options && !options.enabled) {
    return;
  }
  let fullPath = path.join(rootDir, options.localPath);
  console.log('static', urlPath, fullPath);
  app.use(urlPath, express.static(fullPath));
});

if (isDevelopment) {
  const compiler = webpack(webpackConfig);
  app.use(webpackHotMiddleware(compiler));
  app.use('/build', webpackDevMiddleware(compiler, {
    stats: {
      colors: true,
      chunks: false
    }
  }));
}

app.get('/', function (req, res) {
  res.render('index', {
    development: isDevelopment,
    contact_email: 'info@concours-alkindi.fr',
    start_url: process.env.START_URL
  });
});

app.get('/start', function (req, res) {
  fs.readFile("seed.json", function (err, seed) {
    const config = {
      "api_url": "/api/",
      "login_url": "/login",
      "logout_url": "/logout",
      "seed": JSON.parse(seed),
      "csrf_token": "0000000000000000000000000000000000000000"
    };
    const script = `!function () {System.import('alkindi-frontend')
      .then(function (Frontend) {
        Frontend.run(${JSON.stringify(config)}, document.getElementById('main')); })
      .catch(function (ex) { console.log(ex); }); }();`
    res.type('js').send(script);
  });
});
app.post('/api/users/:user_id', function (req, res) {
  fs.readFile("seed.json", function (err, seed) {
    res.type('json').send(seed);
  });
});

const server = http.createServer(app);

const listen_addr = process.env.LISTEN || 8001;
var is_unix_socket = typeof(listen_addr) == 'string' && listen_addr.startsWith('/');
if (is_unix_socket) {
  fs.stat(listen_addr, function (err) {
    if (!err) { fs.unlinkSync(listen_addr); }
    fs.mkdir(path.dirname(listen_addr), function (err) {
      if (err && err.code != 'EEXIST') throw err;
      server.listen(listen_addr, function () {
        fs.chmod(listen_addr, 0o4777, function (err) {
          if (err) throw err;
          console.log(`PID ${process.pid} listening on ${colors.bold(listen_addr)}`);
        });
      });
    })
  });
} else {
  server.listen(listen_addr, function () {
    console.log(`PID ${process.pid} listening on ${colors.bold(listen_addr)}`);
  });
}
