
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

import process from 'process';
import {Promise} from 'es6-promise';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {link, include, defineAction, defineSelector, addReducer, addEnhancer} from 'epic-linker';

import Api from './api';
import {configure as configureAssets} from './assets';
import DevTools from './dev_tools';

import App from './app';
import ClientApi from './client_api';
import Login from './login'
import Refresh from './refresh';
import JoinTeamScreen from './screens/join_team';
import MainScreen from './screens/main';
//import RoundOverScreen from './screens/round_over';
//import FinalScreen from './screens/final';

// Inject style
import "font-awesome/css/font-awesome.min.css!";
import "bootstrap/dist/css/bootstrap.min.css!";
import "rc-tooltip/assets/bootstrap.css!";
import 'rc-collapse/assets/index.css!';
import "alkindi-frontend.css/style.css!";

const isDev = process.env.NODE_ENV === 'development';
const reduxExt = window.__REDUX_DEVTOOLS_EXTENSION__;
if (isDev) {
  System.import('source-map-support').then(m => m.install());
}

const {store, scope, start} = link(function* (deps) {

  yield include(ClientApi);
  yield include(Login);
  yield include(Refresh);
  yield include(App);
  yield include(JoinTeamScreen);
  yield include(MainScreen);

  yield defineAction('init', 'Init');
  yield addReducer('init', function (state, action) {
    const {config} = action;
    return {
      config,
      isDev,
      api: Api(config),
      response: {}
    };
  });

  yield defineAction('setCsrfToken', 'SetCsrfToken');
  yield addReducer('setCsrfToken', function (state, action) {
    const {csrf_token} = action;
    let {config} = state;
    config = {...config, csrf_token};
    return {...state, config, api: Api(config)};
  });

  yield defineSelector('getLoginUrl', function (state) {
    return state.config.login_url;
  });

  yield defineSelector('getLogoutUrl', function (state) {
    return state.config.logout_url;
  });

  if (isDev) {
    if (reduxExt) {
      yield addEnhancer(window.__REDUX_DEVTOOLS_EXTENSION__());
    } else {
      yield addEnhancer(DevTools.instrument());
    }
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
        {reduxExt ? false : <DevTools/>}
      </div>
    </Provider>, container);

  return {store, scope};

};