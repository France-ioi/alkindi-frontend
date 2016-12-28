import {Promise} from 'es6-promise';

import request from 'superagent';

export const ApiFactory = function (methods) {
  const {get, post} = methods;
  return {
    refresh: (user_id, request) => post('users/'+user_id, request),
    addBadge: (user_id, data) => post('users/'+user_id+'/add_badge', data),
    createTeam: (user_id) => post('users/'+user_id+'/create_team'),
    joinTeam: (user_id, data) => post('users/'+user_id+'/join_team', data),
    leaveTeam: (user_id) => post('users/'+user_id+'/leave_team'),
    updateUserTeam: (user_id, data) => post('users/'+user_id+'/update_team', data),
    startAttempt: (user_id) => post('users/'+user_id+'/start_attempt'),
    cancelAttempt: (user_id) => post('users/'+user_id+'/cancel_attempt'),
    enterAccessCode: (user_id, data) => post('users/'+user_id+'/access_code', data),
    assignAttemptTask: (user_id) => post('users/'+user_id+'/assign_attempt_task'),
    getHint: (user_id, data) => post('users/'+user_id+'/get_hint', data),
    resetHints: (user_id) => post('users/'+user_id+'/reset_hints'),
    storeRevision: (user_id, data) => post('users/'+user_id+'/store_revision', data),
    submitAnswer: (user_id, attempt_id, data) => post('users/'+user_id+'/attempts/'+attempt_id+'/answers', data),
    resetTeamToTraining: (team_id) => post('teams/'+team_id+'/reset_to_training'),
    loadRevision: (revision_id) => get('workspace_revisions/'+revision_id)
  };
};

export const Api = function (config) {

  function get (path) {
    return new Promise(function (resolve, reject) {
      var req = request.get(config.api_url + path);
      req.end(function (err, res) {
        if (err || !res.ok)
          return reject({err, res});
        resolve(res.body);
      });
    });
  }

  function post (path, body) {
    return new Promise(function (resolve, reject) {
      var req = request.post(config.api_url + path);
      req.set('X-CSRF-Token', config.csrf_token);
      if (body) {
        req.set('Accept', 'application/json');
        req.send(body);
      }
      req.end(function (err, res) {
        if (err || !res.ok)
          return reject({err, res});
        resolve(res.body);
      });
    });
  }

  return ApiFactory({get, post});
};

export default Api;
