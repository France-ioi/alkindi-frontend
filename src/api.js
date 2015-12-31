var request = require('superagent');

function post (path, data) {
  var req = request.post(Alkindi.config.api_url + path);
  req.set('X-CSRF-Token', Alkindi.config.csrf_token);
  req.set('Accept', 'application/json');
  if (data !== undefined)
    req.send(data);
  return req;
}

export const createTeam = function (user_id, callback) {
  post('users/'+user_id+'/create_team').end(callback);
};
export const joinTeam = function (user_id, data, callback) {
  post('users/'+user_id+'/join_team', data).end(callback);
};
export const leaveTeam = function (user_id, callback) {
  post('users/'+user_id+'/leave_team').end(callback);
};
