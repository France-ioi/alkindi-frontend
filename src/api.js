var request = require('superagent');

function post (path, data) {
  var req = request.post(Alkindi.config.api_url + path);
  req.set('X-CSRF-Token', Alkindi.config.csrf_token);
  req.set('Accept', 'application/json');
  if (data !== undefined)
    req.send(data);
  return req;
}

/* export const logout = function (callback) {
  post('logout').end(callback);
}; */
