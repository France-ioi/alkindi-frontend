'use strict';

// IE8 compatibility:
require('html5shiv');
require('es5-shim');
require('es5-sham-ie8');
// Use el.getAttribute('data-value') rather than el.dataset.value.

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';

import {configure as configureAssets} from './assets';
import reducer from './reducer';
import App from './app';

// Insert our stylesheet.
require('./main.css');

// This is the application's public interface.  FOR EXTERNAL USE ONLY!
window.Alkindi = (function () {
  const Alkindi = {};

  // Create the global state store.
  let store = Alkindi.store = createStore(reducer);

  Alkindi.configure = function (config) {
    Alkindi.config = config;
    if ('assets_template' in config)
      configureAssets({template: config.assets_template});
    if ('user' in config) {
      const {user} = config;
      store.dispatch({type: 'SET_USER', user: user});
    }
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
    const autoStepInterval = setInterval(autoStepCallback, 100);
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
