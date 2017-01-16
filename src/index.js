
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
import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "rc-tooltip/assets/bootstrap.css";
import 'rc-collapse/assets/index.css';
import "./style.css";

const isDev = process.env.NODE_ENV === 'development';
const reduxExt = window.__REDUX_DEVTOOLS_EXTENSION__;

const {store, scope, start} = link(function* (deps) {

  yield include(ClientApi);
  yield include(Login);
  yield include(Refresh); // must be included before task communication
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
      request: {},
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

  Alkindi.run = function () {
    console.log('Alkindi.run called twice');
  };

  // XXX clean this up
  if ('assets_template' in config) {
    configureAssets({template: config.assets_template});
  }

  // Initialize the store.
  store.dispatch({type: scope.init, config});

  // Start the sagas.
  start();

  // Simulate completion of a refresh operation with the backend-provided seed.
  if ('seed' in config) {
    store.dispatch({type: scope.refreshCompleted, success: true, response: config.seed});
  }

  // Render the application.
  ReactDOM.render(
    <Provider store={store}>
      <div>
        {isDev && <div className="dev-banner">{"DEV"}</div>}
        <scope.App/>
        {isDev && !reduxExt && <DevTools/>}
      </div>
    </Provider>, container);

};

// Export a global.
const Alkindi = window.Alkindi = {run};
if (isDev) {
  Object.assign(Alkindi, {store, scope});
}
