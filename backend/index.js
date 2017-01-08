'use strict';

var fs = require('fs');
var path = require('path');
var http = require('http');
var express = require('express');
var colors = require('colors/safe');

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
    localPath: 'build'
  },
  '/jspm.config.js': {
    localPath: 'jspm.config.js',
    enabled: true
  },
  // The package manager files are served at /jspm_packages.
  // This is needed in production for dependency assets (fonts, images, css).
  '/jspm_packages': {
    localPath: 'jspm_packages'
  },
  // Source frontend files are served at /src.
  '/src': {
    localPath: 'src',
    enabled: isDevelopment
  },
  '/lib': {
    localPath: 'lib',
    enabled: isDevelopment
  },
  '/jspm.dev.js': {
    localPath: 'jspm.dev.js',
    enabled: isDevelopment
  }
};
Object.keys(staticAssets).forEach(function (urlPath) {
  const options = staticAssets[urlPath];
  if ('enabled' in options && !options.enabled) {
    return;
  }
  let fullPath = path.join(rootDir, options.localPath);
  // console.log('static', urlPath, fullPath);
  app.use(urlPath, express.static(fullPath));
});

app.get('/', function (req, res) {
  res.render('index', {
    development: isDevelopment,
    contact_email: 'info@concours-alkindi.fr',
    start_url: process.env.START_URL
  });
});

app.get('/dev/start', function (req, res) {
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
