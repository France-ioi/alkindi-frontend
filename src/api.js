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

function withSuccessCheck (callback) {
  return function (err, res) {
    if (err) return callback(err);
    if (!res.body.success)
      return callback(res.body);
    return callback(err, res.body);
  };
}

export const readUser = function (user_id, callback) {
  get('users/'+user_id).end(callback);
};
export const createTeam = function (user_id, callback) {
  post('users/'+user_id+'/create_team').end(withSuccessCheck(callback));
};
export const joinTeam = function (user_id, data, callback) {
  post('users/'+user_id+'/join_team', data).end(withSuccessCheck(callback));
};
export const leaveTeam = function (user_id, callback) {
  post('users/'+user_id+'/leave_team').end(withSuccessCheck(callback));
};
export const updateUserTeam = function (user_id, data, callback) {
  post('users/'+user_id+'/update_team', data).end(withSuccessCheck(callback));
};
export const startAttempt = function (user_id, callback) {
  post('users/'+user_id+'/start_attempt').end(withSuccessCheck(callback));
};
export const cancelAttempt = function (user_id, callback) {
  post('users/'+user_id+'/cancel_attempt').end(withSuccessCheck(callback));
};
export const getAccessCode = function (user_id, callback) {
  get('users/'+user_id+'/access_code').end(withSuccessCheck(callback));
};
export const enterAccessCode = function (user_id, data, callback) {
  post('users/'+user_id+'/access_code', data).end(withSuccessCheck(callback));
};
export const assignAttemptTask = function (user_id, callback) {
  post('users/'+user_id+'/assign_attempt_task').end(withSuccessCheck(callback));
};
export const getHint = function (user_id, data, callback) {
  post('users/'+user_id+'/get_hint', data).end(withSuccessCheck(callback));
};
export const storeRevision = function (user_id, data, callback) {
  post('users/'+user_id+'/store_revision', data).end(withSuccessCheck(callback));
};
export const loadRevision = function (revision_id, callback) {
  get('workspace_revisions/'+revision_id).end(callback);
};
