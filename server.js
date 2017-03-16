'use strict';

var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var express = require('express');
var colors = require('colors/safe');

const isDevelopment = process.env.NODE_ENV !== 'production';
console.log(`running in ${isDevelopment ? colors.red('development') : colors.green('production')} mode`);

const rootDir = path.resolve(__dirname);
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(rootDir, 'views'));

if (isDevelopment) {
  // Development route: /build is managed by webpack
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackConfig = require('./webpack.config.js');
  const compiler = webpack(webpackConfig);
  app.use('/build', webpackDevMiddleware(compiler, {
    stats: {
      colors: true,
      chunks: false
    }
  }));
} else {
  // Production route: /build serves static files in build/
  app.use('/build', express.static(path.join(rootDir, 'build')));
}
app.use('/assets', express.static(path.join(rootDir, 'assets')));

app.get('/', function (req, res) {
  const startUrl = process.env.START_URL || '/start';
  const originalUrl = url.parse(req.originalUrl, false);
  res.render('index', {
    development: isDevelopment,
    contact_email: 'info@concours-alkindi.fr',
    start_url: startUrl + (originalUrl.search || '')
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
    const script = `Alkindi.run(${JSON.stringify(config)}, document.getElementById('main'));`
    res.type('js').send(script);
  });
});

app.post('/api/refresh', function (req, res) {
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
          reportReadiness();
        });
      });
    })
  });
} else {
  server.listen(listen_addr, function (err) {
    if (err) throw err;
    reportReadiness();
  });
}
function reportReadiness () {
  console.log(`PID ${process.pid} listening on ${colors.bold(listen_addr)}`);
}
