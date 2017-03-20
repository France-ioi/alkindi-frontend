
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
import link from 'epic-linker';
import {put} from 'redux-saga/effects';

import Api from './api';
import DevTools from './dev_tools';

import App from './app';
import ClientApi from './client_api';
import Login from './login'
import Refresh from './refresh';
import JoinTeamScreen from './screens/join_team';
import MainScreen from './screens/main';
import RevisionsBundle from './revisions';
import RoundOverScreen from './screens/round_over';
import FinalScreen from './screens/final';
import CountdownBundle from './countdown';

// Inject style
import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "rc-tooltip/assets/bootstrap.css";
import 'rc-collapse/assets/index.css';
import "./style.css";

const isDev = process.env.NODE_ENV !== 'production';
const reduxExt = window.__REDUX_DEVTOOLS_EXTENSION__;

const app = link(function (bundle, deps) {

  /* Make sure init is earliest in link order to avoid overwriting state added
     by reducer in bundles included later. */
  bundle.defineAction('init', 'Init');
  bundle.addReducer('init', function (state, action) {
    const {config} = action;
    return {
      config,
      isDev,
      api: Api(config),
      request: {},
      response: {}
    };
  });

  /* When the sagas crash, a 'crashed' action is dispatched, causing the
     'crashed' property to be set on the global state, which causes the
     crash screen to be displayed. */
  bundle.defineAction('crashed', 'Crashed');
  bundle.addReducer('crashed', function (state, action) {
    return {...state, crashed: true};
  });

  /* When the user clicks the 'continue' button on the crash screen, the
     sagas are restarted.  If things go well, the saga below will put the
    'restarted' action, whose reducer will clear the 'crashed' property
    from the global state, restoring the normal display. */
  bundle.defineAction('restarted', 'Restarted');
  bundle.addSaga(function* () {
    yield put({type: deps.restarted});
  });
  bundle.addReducer('restarted', function (state, action) {
    return {...state, crashed: false};
  });

  bundle.include(ClientApi);
  bundle.include(Login);
  bundle.include(Refresh); // must be included before task communication
  bundle.include(App);
  bundle.include(JoinTeamScreen);
  bundle.include(MainScreen);
  bundle.include(FinalScreen);
  bundle.include(RoundOverScreen);
  bundle.include(RevisionsBundle);
  bundle.include(CountdownBundle);

  bundle.defineAction('setCsrfToken', 'SetCsrfToken');
  bundle.addReducer('setCsrfToken', function (state, action) {
    const {csrf_token} = action;
    let {config} = state;
    config = {...config, csrf_token};
    return {...state, config, api: Api(config)};
  });

  bundle.defineSelector('getLoginUrl', function (state) {
    return state.config.login_url;
  });

  bundle.defineSelector('getLogoutUrl', function (state) {
    return state.config.logout_url;
  });

  if (isDev) {
    if (reduxExt) {
      bundle.addEnhancer(window.__REDUX_DEVTOOLS_EXTENSION__());
    } else {
      bundle.addEnhancer(DevTools.instrument());
    }
  }

});

export function run (config, container) {

  Alkindi.run = function () {
    console.log('Alkindi.run called twice');
  };

  // Initialize the store.
  app.store.dispatch({type: app.scope.init, config});

  // Start the sagas.
  function crashed (error) {
    app.store.dispatch({type: app.scope.crashed});
  }
  Alkindi.restart = function () {
    app.store.dispatch({type: app.scope.restarted});
    Alkindi.rootTask = app.start();
    Alkindi.rootTask.done.then(crashed).catch(crashed);
  };
  Alkindi.restart();

  // Simulate completion of a refresh operation with the backend-provided seed.
  if ('seed' in config) {
    app.store.dispatch({type: app.scope.refreshCompleted, success: true, response: config.seed});
  }

  // Render the application.
  ReactDOM.render(
    <Provider store={app.store}>
      <div>
        {isDev && <div className="dev-banner">{"DEV"}</div>}
        <app.scope.App/>
        {isDev && !reduxExt && <DevTools/>}
      </div>
    </Provider>, container);

};

// Export a global.
const Alkindi = window.Alkindi = {run};
if (isDev) {
  Object.assign(Alkindi, app);
}
