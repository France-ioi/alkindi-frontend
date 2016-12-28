
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
import {link, include, defineAction, defineSelector, addReducer, addEnhancer} from 'epic-linker';

import Api from './api';
import DevTools from './dev_tools';
import App from './app';
import Login from './login'
import JoinTeam from './join_team';
import Refresh from './refresh';

import './base.scss!scss';
import "font-awesome/css/font-awesome.min.css!";
import "rc-tooltip/assets/bootstrap.css!";
import './index.scss!scss';

// XXX old imports, review

const {store, scope, start} = link(function* (deps) {

  yield include(App);
  yield include(ClientApi);
  yield include(Login);
  yield include(JoinTeam);
  yield include(Refresh);

  yield defineAction('init', 'Init');
  yield addReducer('init', function (state, action) {
    const {config} = action;
    return {
      config,
      api: new Api(config),
      response: {}
    };
  });

  yield defineAction('setCsrfToken', 'SetCsrfToken');

  yield defineSelector('getLoginUrl', function (state) {
    return state.config.login_url;
  });

  yield defineSelector('getLogoutUrl', function (state) {
    return state.config.logout_url;
  });

  // yield addEnhancer(DevTools.instrument());
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    yield addEnhancer(window.__REDUX_DEVTOOLS_EXTENSION__());
  }

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

  // Start the sagas.
  start();
  if ('seed' in config) {
    store.dispatch({type: scope.refreshSucceeded, response: config.seed});
  }

  // Render the application.
  ReactDOM.render(
    <Provider store={store}>
      <div>
        <scope.App/>
        <DevTools/>
      </div>
    </Provider>, container);

  return {store, scope};

};