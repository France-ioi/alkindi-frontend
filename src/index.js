'use strict';

// IE8 compatibility:
import 'html5shiv';
import 'es5-shim';
import 'es5-sham-ie8';
// IE9+ compatibility:
import ObjectAssign from 'object.assign';
ObjectAssign.shim();
// Array.prototype.find not available on Chrome
import 'es6-shim';
// Array.prototype.fill not available on IE
import 'array.prototype.fill';
// Use el.getAttribute('data-value') rather than el.dataset.value.

import {Promise} from 'es6-promise';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {link, include, defineAction, defineSelector, addReducer} from 'epic-linker';

import App from './app';
import Login from './login'

import './base.scss!scss';
import "rc-tooltip/assets/bootstrap.css!";
import './index.scss!scss';

// XXX old imports, review
import {configure as configureAssets} from './assets';
import {Api, ApiFactory} from './api'; // XXX
import {WorkspaceManager} from './workspace';

const {store, scope, start} = link(function* (deps) {

  yield include(App);
  yield include(Login);

  yield defineAction('init', 'Init');
  yield addReducer('init', function (state, action) {
    const {config} = action;
    return {
      config,
      response: {}
    };
  });

  // XXX to refresh.js
  yield defineAction('refresh', 'Refresh');

  yield defineAction('setCsrfToken', 'SetCsrfToken');

  yield defineSelector('getLoginUrl', function (state) {
    return state.config.login_url;
  });

  yield defineSelector('getLogoutUrl', function (state) {
    return state.config.logout_url;
  });

});

export function run (config, container) {

  /*
  System.import("@system-env").then(function (env) {
    console.log('running in', env.production ? 'production' : 'development', 'mode');
  });
  */

  // Initialize the store.
  if ('assets_template' in config) {
    configureAssets({template: config.assets_template}); // XXX
  }
  store.dispatch({type: scope.init, config});
  // const manager = WorkspaceManager(store); XXX

  // Start the sagas.
  start();
  if ('seed' in config) {
    store.dispatch({type: 'END_REFRESH', response: config.seed});
  }

  // Trigger an initial refresh.
  store.dispatch({type: scope.refresh});

  // Render the application.
  // TODO: push DragDropContext into the task tab.
  const WrappedApp = DragDropContext(HTML5Backend)(scope.App);
  ReactDOM.render(<Provider store={store}><WrappedApp/></Provider>, container);

  return {store, scope};

};
