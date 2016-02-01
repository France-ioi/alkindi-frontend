import {Promise} from 'es6-promise';

import {EventEmitter} from 'events';
var request = require('superagent');

export const ApiFactory = function (methods) {
  const {get, post} = methods;
  return {
    refresh: (user_id, request) => post('users/'+user_id, request),
    qualifyUser: (user_id, data) => post('users/'+user_id+'/qualify', data),
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

const locationSearchAsObject = function () {
  return window.location.search.substring(1).split("&").reduce(function(result, value) {
    const parts = value.split('=');
    if (parts[0] !== "") {
      result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
    return result;
  }, {})
};

export const Api = function (config) {

  function get (path) {
    var req = request.get(config.api_url + path + window.location.search);
    req.set('Accept', 'application/json');
    req.set('X-Frontend-Version', config.frontend_version);
    return req;
  }

  function post (path, data) {
    var req = request.post(config.api_url + path);
    req.set('X-CSRF-Token', config.csrf_token);
    req.set('Accept', 'application/json');
    req.set('X-Frontend-Version', config.frontend_version);
    const postBody = {};
    Object.assign(postBody, data, {override: locationSearchAsObject()});
    req.send(postBody);
    return req;
  }

  const bare = ApiFactory({get, post});

  const emitter = new EventEmitter();
  const api = {emitter, bare};
  Object.keys(bare).map(function (action) {
    api[action] = function (...args) {
      return new Promise(function (resolve, reject) {
        emitter.emit('begin');
        bare[action](...args).end(function (err, res) {
          if (err) {
            emitter.emit('server_error', err, res);
            reject({success: false, error: 'failed', source: 'server'});
            return;
          }
          if (res.body.success === false) {
            emitter.emit('backend_error', res.body);
            reject(res.body);
            return;
          }
          emitter.emit('end', res);
          resolve(res.body);
        });
      });
    };
  });

  return api;
};

export default Api;
