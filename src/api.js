import {Promise} from 'es6-promise';

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

export const BareApi = {
  readUser: (user_id) => get('users/'+user_id),
  qualifyUser: (user_id, data) => post('users/'+user_id+'/qualify', data),
  createTeam: (user_id) => post('users/'+user_id+'/create_team'),
  joinTeam: (user_id, data) => post('users/'+user_id+'/join_team', data),
  leaveTeam: (user_id) => post('users/'+user_id+'/leave_team'),
  updateUserTeam: (user_id, data) => post('users/'+user_id+'/update_team', data),
  startAttempt: (user_id) => post('users/'+user_id+'/start_attempt'),
  cancelAttempt: (user_id) => post('users/'+user_id+'/cancel_attempt'),
  getAccessCode: (user_id) => get('users/'+user_id+'/access_code'),
  enterAccessCode: (user_id, data) => post('users/'+user_id+'/access_code', data),
  assignAttemptTask: (user_id) => post('users/'+user_id+'/assign_attempt_task'),
  getHint: (user_id, data) => post('users/'+user_id+'/get_hint', data),
  resetHints: (user_id) => post('users/'+user_id+'/reset_hints'),
  storeRevision: (user_id, data) => post('users/'+user_id+'/store_revision', data),
  loadRevision: (revision_id) => get('workspace_revisions/'+revision_id),
  listAttemptRevisions: (attempt_id) => get('attempts/'+attempt_id+'/revisions'),
  submitAnswer: (user_id, attempt_id, data) => post('users/'+user_id+'/attempts/'+attempt_id+'/answers', data),
  listAttemptAnswers: (attempt_id) => get('attempts/'+attempt_id+'/answers')
};

export const Api = function () {
  const api = {};
  let helper;
  api.$setHelper = function (newHelper) {
    helper = newHelper;
  };
  Object.keys(BareApi).map(function (action) {
    api[action] = function (...args) {
      return new Promise(function (resolve, reject) {
        helper && helper.begin();
        BareApi[action](...args).end(function (err, res) {
          if (err) {
            helper && helper.endWithServerError(err, res);
            reject({success: false, error: 'failed', source: 'server'});
            return;
          }
          if (res.body.success === false) {
            helper && helper.endWithBackendError(res.body);
            reject(res.body);
            return;
          }
          const options = {refresh: true};
          options.method = res.req.method;
          resolve(res.body, options);
          helper && helper.end(options);
        });
      });
    };
  });
  return api;
};

export default Api;
