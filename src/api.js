import {Promise} from 'es6-promise';

import request from 'superagent';

export const ApiFactory = function (methods) {
  const {get, post} = methods;
  return {

    refresh: (request) => post('refresh', request),

    createTeam: (user_id) => post('users/'+user_id+'/create_team'),
    joinTeam: (user_id, data) => post('users/'+user_id+'/join_team', data),
    leaveTeam: (user_id) => post('users/'+user_id+'/leave_team'),
    updateUserTeam: (user_id, data) => post('users/'+user_id+'/update_team', data),

    addBadge: (user_id, data) => post('users/'+user_id+'/add_badge', data),
    createAttempt: (participation_id, round_task_id) => post('participations/'+participation_id+'/tasks/'+round_task_id+'/create_attempt'),
    // enterAccessCode: (user_id, data) => post('users/'+user_id+'/access_code', data),
    startAttempt: (attempt_id) => post('attempts/'+attempt_id+'/start'),

    getHint: (attempt_id, data) => post('attempts/'+attempt_id+'/get_hint', data),
    resetHints: (attempt_id) => post('attempts/'+attempt_id+'/reset_hints'),

    submitAnswer: (attempt_id, data) => post('attempts/'+attempt_id+'/answer', data),

    storeRevision: (attempt_id, data) => post('attempt_id/'+attempt_id+'/store_revision', data),
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
