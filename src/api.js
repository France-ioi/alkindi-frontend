import {Promise} from 'es6-promise';

import request from 'superagent';

export const ApiFactory = function (methods) {
  const {get, post} = methods;
  return {

    refresh: (request) => post('api/refresh', request),

    addBadge: (user_id, data) => post('api/users/'+user_id+'/add_badge', data),

    createTeam: (user_id) => post('api/users/'+user_id+'/create_team'),
    joinTeam: (user_id, data) => post('api/users/'+user_id+'/join_team', data),
    leaveTeam: (user_id) => post('api/users/'+user_id+'/leave_team'),
    updateUserTeam: (user_id, data) => post('api/users/'+user_id+'/update_team', data),

    createAttempt: (participation_id, round_task_id) => post('participations/'+participation_id+'/tasks/'+round_task_id+'/create_attempt'),

    // enterAccessCode: (user_id, data) => post('users/'+user_id+'/access_code', data),
    startAttempt: (attempt_id) => post('api/attempts/'+attempt_id+'/start'),

    getHint: (attempt_id, data) => post('api/attempts/'+attempt_id+'/get_hint', data),
    resetHints: (attempt_id) => post('api/attempts/'+attempt_id+'/reset_hints'),

    submitAnswer: (user_id, attempt_id, data) => post(`api/users/${user_id}/attempts/${attempt_id}/answer`, data),
    storeRevision: (user_id, attempt_id, data) => post(`api/users/${user_id}/attempts/${attempt_id}/store_revision`, data),

    loadRevision: (revision_id) => get(`api/workspace_revisions/${revision_id}`),

    enterParticipationCode: (participation_id, data) => post(`api/participations/${participation_id}/enter_code`, data),
    loginWithParticipationCode: (data) => post('login/participation', data)

  };
};

export const Api = function (config) {

  function get (path) {
    return new Promise(function (resolve, reject) {
      var req = request.get(config.backend_url + path);
      req.end(function (err, res) {
        if (err || !res.ok)
          return reject({err, res});
        resolve(res.body);
      });
    });
  }

  function post (path, body) {
    return new Promise(function (resolve, reject) {
      var req = request.post(config.backend_url + path);
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
