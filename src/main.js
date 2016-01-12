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
  let loginWindow;
  let loginOutcome;

  const sendTick = function () {
    store.dispatch({type: 'TICK'});
  };

  const openInLoginWindow = function (url) {
    loginWindow = window.open(url, "alkindi:login",
      "height=555, width=510, toolbar=yes, menubar=yes, scrollbars=no, resizable=no, location=no, directories=no, status=no");
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
      const promise = Alkindi.refresh(message.user_id);
      if (loginOutcome) {
        const {resolve, reject} = loginOutcome;
        loginOutcome = undefined;
        promise.then(resolve, reject);
      }
      return;
    }
    if (message.action === 'afterLogout') {
      Alkindi.dispatch({'type': 'AFTER_LOGOUT'});
      window.location.reload()
    }
  };

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

  Alkindi.configure = function (config) {
    Alkindi.config = config;
    Alkindi.Api = ApiFactory;
    Alkindi.api = Api(config);
    if ('assets_template' in config)
      configureAssets({template: config.assets_template});
    store.dispatch({type: 'INIT'});
    if ('seed' in config)
      store.dispatch({type: 'END_REFRESH', response: config.seed});
  };

  Alkindi.install = function (mainElement) {
    window.addEventListener('message', messageListener);
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
      openInLoginWindow(Alkindi.config.login_url)
    })
  };

  Alkindi.logout = function () {
    openInLoginWindow(Alkindi.config.logout_url);
  };

  return Alkindi;
}());
