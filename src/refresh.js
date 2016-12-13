
// XXX saga
Alkindi.refresh = function (user_id, request) {
  const state = store.getState();
  // Support omitting the user_id and the request, reading the value from state.
  if (typeof user_id === 'object') {
    request = user_id;
    user_id = undefined;
  }
  if (user_id === undefined)
    user_id = state.user_id;
  if (typeof request !== 'object') {
    request = state.request;
  }
  if (request === undefined)
    request = {};
  return new Promise(function (resolve, reject) {
    store.dispatch({type: 'BEGIN_REFRESH', user_id, request});
    Alkindi.api.bare.refresh(user_id, request).end(function (err, res) {
      if (err) {
        if (err.status == 403) {
          alert("Vous êtes déconnecté, reconnectez-vous pour continuer.");
          Alkindi.login().then(function () {
            Alkindi.refresh(request);
          });
        }
        store.dispatch({type: 'CANCEL_REFRESH'});
        return reject(err, request);
      }
      const response = res.body;
      const frontend_version = res.header['x-frontend-version'];
      store.dispatch({type: 'END_REFRESH', response, user_id, request, frontend_version});
      const event = {response, user_id, request, frontend_version};
      Alkindi.api.emitter.emit('refresh', event);
      resolve(event);
    });
  });
};

