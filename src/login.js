
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {use, defineAction, defineSelector, defineView, addSaga, addReducer} from 'epic-linker';
import {eventChannel, buffers} from 'redux-saga';
import {put, take, select} from 'redux-saga/effects'

import AuthHeader from './ui/auth_header';

export default function* (deps) {

  yield use('getLoginUrl', 'getLogoutUrl', 'setCsrfToken', 'refresh');

  yield defineAction('login', 'Login');
  yield defineAction('loginFeedback', 'Login.Feedback'); // sent via client API
  yield defineAction('loginSucceeded', 'Login.Succeeded');
  yield defineAction('loginFailed', 'Login.Failed');

  yield defineAction('logout', 'Logout');
  yield defineAction('logoutFeedback', 'Logout.Feedback'); // sent via client API
  yield defineAction('logoutSucceeded', 'Logout.Succeeded');
  yield defineAction('logoutFailed', 'Logout.Failed');

  yield defineSelector('LoginScreenSelector', function (state) {
    return {};
  });

  yield defineView('LoginScreen', 'LoginScreenSelector', EpicComponent(self => {
    const onLogin = function () {
      self.props.dispatch({type: deps.login});
    };
    self.render = function () {
      return (
        <div className="wrapper">
          <AuthHeader/>
          <div className="section">
            <p>Bienvenue sur la plateforme du 2<sup>nd</sup> tour du concours Alkindi.</p>
            <p>
              Pour accéder à l'interface du concours, connectez vous en cliquant
              sur ce bouton:
            </p>
            <p><Button onClick={onLogin}>se connecter</Button></p>
          </div>
        </div>
      );
    };
  }));

  yield defineSelector('LogoutButtonSelector', function (state) {
    const {user} = state.response;
    return {user};
  });

  yield defineView('LogoutButton', 'LogoutButtonSelector', EpicComponent(self => {
    const onLogout = function () {
      self.props.dispatch({type: deps.logout});
    };
    self.render = function () {
      const {user} = self.props;
      if (!user) {
        return false;
      }
      const {username} = user;
      return (
        <div id="logout">
          <span>{username}</span>
          <Button onClick={onLogout}>déconnexion</Button>
        </div>
      );
    };
  }));

  let loginWindow;

  const openInLoginWindow = function (url) {
    /* Ensure the login/logout page gets reloaded even if already open. */
    if (loginWindow !== undefined) {
      loginWindow.close();
      loginWindow = undefined;
    }
    loginWindow = window.open(url, "alkindi:login",
      "height=555, width=510, toolbar=yes, menubar=yes, scrollbars=no, resizable=no, location=no, directories=no, status=no");
  };

  yield addSaga(function* () {
    /* On login, display the login window.  An iframe cannot be used due to a
       privacy setting ("Block third-party cookies and site data" on Chrome)
       that blocks cookies for origin X when an iframe with origin X is opened
       on a page with origin Y. */
    while (true) {
      yield take(deps.login);
      let loginUrl = yield select(deps.getLoginUrl);
      openInLoginWindow(loginUrl);
    }
  });

  yield addSaga(function* () {
    /* On logout, display the logout window in a popup. */
    while (true) {
      yield take(deps.logout);
      let logoutUrl = yield select(deps.getLogoutUrl);
      openInLoginWindow(logoutUrl);
    }
  });

  /* Handle login feedback messages, posted by the backend via the client API.
      {'user_id', 'csrf_token'}
      {'error'}
   */
  yield addSaga(function* () {
    while (true) {
      let {error, csrf_token, user_id} = yield take(deps.loginFeedback);
      if (error) {
        yield put({type: deps.loginFailed, error});
      } else {
        if (csrf_token) {
          /* The CSRF token is cleared when the user logs out, and the server
             may need to send us a new one after the user has re-authenticated. */
          yield put({type: deps.setCsrfToken, csrf_token});
        }
        /* Indicate that login succeeded. */
        yield put({type: deps.loginSucceeded, userId: user_id});
        /* Trigger a refresh for the now logged-in user. */
        yield put({type: deps.refresh});
      }
    }
  });

  yield addReducer('loginSucceeded', function (state, action) {
    const {userId} = action;
    return {...state, userId};
  });

  /* Handle logout messages posted by the backend via the client API. */
  yield addSaga(function* () {
    while (true) {
      let {error} = yield take(deps.logoutFeedback);
      if (error) {
        yield put({type: deps.logoutFailed, error});
      } else {
        yield put({type: deps.logoutSucceeded});
      }
    }
  });

  yield addReducer('logoutSucceeded', function (state, action) {
    // TODO: update enabledTabs
    return {...state, userId: undefined, request: {}, response: {}};
  });

};
