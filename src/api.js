var request = require('superagent');

function get (path) {
  var req = request.get(Alkindi.config.api_url + path);
  req.set('Accept', 'application/json');
  return req;
}

function post (path, data) {
  var req = request.post(Alkindi.config.api_url + path);
  req.set('X-CSRF-Token', Alkindi.config.csrf_token);
  req.set('Accept', 'application/json');
  if (data !== undefined)
    req.send(data);
  return req;
}

export const readUser = function (user_id, callback) {
  get('users/'+user_id).end(callback);
};
export const createTeam = function (user_id, callback) {
  post('users/'+user_id+'/create_team').end(callback);
};
export const joinTeam = function (user_id, data, callback) {
  post('users/'+user_id+'/join_team', data).end(callback);
};
export const leaveTeam = function (user_id, callback) {
  post('users/'+user_id+'/leave_team').end(callback);
};
export const updateUserTeam = function (user_id, data, callback) {
  post('users/'+user_id+'/update_team', data).end(callback);
};
export const startAttempt = function (user_id, callback) {
  post('users/'+user_id+'/start_attempt').end(callback);
};
export const cancelAttempt = function (user_id, callback) {
  post('users/'+user_id+'/cancel_attempt').end(callback);
};
