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

import {configure as configureAssets} from './assets';
import reducer from './reducer';
import App from './app';

// Install a global error handler.
let logErrors = true;
const logUrl = 'https://alkindi.epixode.fr/reports/';
window.onerror = function (message, url, line, column, error) {
  // Prevent firing the default handler for errors on log URLs.
  if (url.startsWith(logUrl))
    return true;
  try {
    const img = document.createElement('img');
    const qs = [
      'version=' + encodeURIComponent(Alkindi.config.front_version),
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
  let store = Alkindi.store = createStore(reducer);

  Alkindi.configure = function (config) {
    Alkindi.config = config;
    if ('assets_template' in config)
      configureAssets({template: config.assets_template});
    if ('seed' in config)
      store.dispatch({type: 'INIT', seed: config.seed});
  };

  Alkindi.install = function (mainElement) {
    // Enable auto-step interval.
    // XXX This should be done by an action.
    function autoStepCallback () {
      const state = store.getState();
      if (!state.autoRefresh || state.toolPointer === undefined)
        return;
      store.dispatch({type: 'STEP'});
    }
    const _autoStepInterval = setInterval(autoStepCallback, 100);
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

  return Alkindi;
}());
