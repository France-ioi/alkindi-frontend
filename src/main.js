'use strict';

// IE8 compatibility:
require('html5shiv');
require('es5-shim');
require('es5-sham-ie8');
// IE9+ compatibility:
require('object.assign').shim();
// Use el.getAttribute('data-value') rather than el.dataset.value.

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {Promise} from 'es6-promise';

import {configure as configureAssets} from './assets';
import reducer from './reducer';
import App from './app';
import {Api, ApiFactory} from './api';

// Install a global error handler.
const logUrl = 'https://alkindi.epixode.fr/reports/';
window.onerror = function (message, url, line, column, error) {
  // Prevent firing the default handler for errors on log URLs.
  if (url.startsWith(logUrl))
    return true;
  try {
    const img = document.createElement('img');
    const qs = [
      'version=' + encodeURIComponent(Alkindi.config.frontend_version),
      'user_id=' + encodeURIComponent(Alkindi.config.seed.user.id)
    ];
    if (!Alkindi.config.nocdn) {
      // If the scripts bundle is hosted on a CDN, the arguments will be
      // uninteresting.  Reload the page bypassing the CDN.
      // window.location.search = '?nocdn';
      qs.push('url=' + encodeURIComponent(url));
      qs.push('line=' + encodeURIComponent(line));
      qs.push('column=' + encodeURIComponent(column));
      qs.push('message=' + encodeURIComponent(message));
      qs.push('printer=' + encodeURIComponent(printer));
      let strError, printer;
      try { strError = JSON.stringify(error); printer = 'json'; } catch (err) {
      try { strError = error.toString(); printer = 'toString'; } catch (err) {
        strError = err.toString();
        printer = 'null';
      }};
      qs.push('error=' + encodeURIComponent(strError));
    }
    img.src = logUrl + '?' + qs.join('&');
    document.getElementById('reports').appendChild(img);
  } catch (err) {
    console.log('double fault', err);
  }
};
// Use this function to manually send an error report.
window.reportError = function (value) {
  setTimeout(function () { throw value; }, 0);
};

// This is the application's public interface.  FOR EXTERNAL USE ONLY!
/*global Alkindi*/
window.Alkindi = (function () {
  const Alkindi = {};

  // Create the global state store.
  const store = Alkindi.store = createStore(reducer);
  let sendTickInterval;
  let alertRefVersion;

  const refresh = function (user_id) {
    return new Promise(function (resolve, reject) {
      store.dispatch({type: 'BEGIN_REFRESH', user_id});
      Alkindi.api.bare.readUser(user_id).end(function (err, res) {
        if (err) {
          if (err.status == 403) {
            alert("Vous êtes déconnecté, reconnectez-vous pour continuer.");
            Alkindi.login().then(function () { Alkindi.refresh(); });
          }
          store.dispatch({type: 'CANCEL_REFRESH'});
          return reject();
        }
        let frontend_version = res.header['x-frontend-version'];
        if (frontend_version !== alertRefVersion) {
          alertRefVersion = frontend_version;
          alert('Une mise à jour est disponible, rechargez la page quand vous pouvez.');
        }
        store.dispatch({type: 'END_REFRESH', seed: res.body});
        resolve();
      });
    });
  };
  Alkindi.refresh = function (user_id) {
    return refresh(user_id || store.getState().user.id);
  };

  Alkindi.configure = function (config) {
    Alkindi.config = config;
    Alkindi.Api = ApiFactory;
    Alkindi.api = Api(config);
    alertRefVersion = config.frontend_version;
    if ('assets_template' in config)
      configureAssets({template: config.assets_template});
    store.dispatch({type: 'INIT', refresh: refresh});
    if ('seed' in config)
      store.dispatch({type: 'END_REFRESH', seed: config.seed});
  };

  Alkindi.install = function (mainElement) {
    function sendTick () {
      store.dispatch({type: 'TICK'});
    }
    sendTickInterval = setInterval(sendTick, 1000);
    // Insert HTML.
    ReactDOM.render(<Provider store={store}><App/></Provider>, mainElement);
  };

  Alkindi.dispatch = function (action) {
    if (Array.isArray(action)) {
      action.forEach(function (action) { store.dispatch(action); });
    } else {
      store.dispatch(action);
    }
  };

  let loginWindow;
  let loginOutcome;
  Alkindi.login = function () {
    return new Promise(function (resolve, reject) {
      if (loginWindow !== undefined) {
        loginWindow.close();
        loginWindow = undefined;
        if (loginOutcome) {
          const {reject} = loginOutcome;
          loginOutcome = undefined;
          reject();
        }
      }
      // Save the resolve/reject callback for use in the refresh initiated
      // in the afterLogin message handler.
      loginOutcome = {resolve, reject};
      const login_url = Alkindi.config.login_url;
      loginWindow = window.open(login_url, "alkindi:login",
        "height=555, width=510, toolbar=yes, menubar=yes, scrollbars=no, resizable=no, location=no, directories=no, status=no");
    })
  };

  const messageListener = function (event) {
    // TODO: understand why event.isTrusted is false on Firefox.
    const message = JSON.parse(event.data);
    if (message.action === 'afterLogin') {
      // Assume the login window closed itself immediately after posting
      // the message.
      loginWindow = undefined;
      // The CSRF token is cleared when the user logs out, and the server
      // may need to send us a new one after the user has re-authenticated.
      Alkindi.config.csrf_token = message.csrf_token;
      // Perform a refresh, and chain it with the resolve/reject outcomes
      // of the login promise.
      const promise = refresh(message.user_id);
      if (loginOutcome) {
        const {resolve, reject} = loginOutcome;
        loginOutcome = undefined;
        promise.then(resolve, reject);
      }
    }
  };
  window.addEventListener('message', messageListener);

  return Alkindi;
}());
