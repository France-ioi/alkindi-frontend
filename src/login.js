
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {use, defineAction, defineSelector, defineView, addSaga} from 'epic-linker';
import {eventChannel, buffers} from 'redux-saga';
import {put, take, select} from 'redux-saga/effects'

import AuthHeader from './ui/auth_header';

export default function* (deps) {

  yield use('getLoginUrl', 'getLogoutUrl', 'setCsrfToken', 'refresh');

  yield defineAction('login', 'Login');
  yield defineAction('loginFailed', 'Login.Failed');
  yield defineAction('loginSucceeded', 'Login.Succeeded');

  yield defineAction('logout', 'Logout');
  yield defineAction('logoutSucceeded', 'Logout.Succeeded');

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
    // Ensure the login/logout page gets reloaded even if already open.
    if (loginWindow !== undefined) {
      loginWindow.close();
      loginWindow = undefined;
    }
    loginWindow = window.open(url, "alkindi:login",
      "height=555, width=510, toolbar=yes, menubar=yes, scrollbars=no, resizable=no, location=no, directories=no, status=no");
  };

  yield addSaga(function* () {
    // On login, display the login window.
    while (true) {
      yield take(deps.login);
      const loginUrl = yield select(deps.getLoginUrl);
      openInLoginWindow(loginUrl);
    }
  });

  yield addSaga(function* () {
    // On logout, display the logout window.
    while (true) {
      yield take(deps.logout);
      const logoutUrl = yield select(deps.getLogoutUrl);
      openInLoginWindow(logoutUrl);
    }
  });

  // Event channel holding the last login/logout-related window message.
  const loginMessageChannel = eventChannel(function (listener) {
    const onMessage = function (event) {
      const message = JSON.parse(event.data);
      if (/^(afterLogin|afterLogout)$/.test(message.action)) {
        listener(message);
      }
    };
    window.addEventListener('message', onMessage);
    return function () {
      window.removeEventListener('message', onMessage);
    };
  }, buffers.sliding(1));

  yield addSaga(function* () {
    // Handle afterLogin, afterLogout messages sent by the login window.
    let message = yield take(loginMessageChannel);
    if (message.action === 'afterLogin') {
      const {csrf_token, user_id} =  message;
      // Assume the login window closed itself immediately after posting
      // the message.
      loginWindow = undefined;
      // The CSRF token is cleared when the user logs out, and the server
      // may need to send us a new one after the user has re-authenticated.
      yield put({type: deps.setCsrfToken, csrf_token});
      // Perform a refresh.
      yield put({type: deps.refresh, user_id});
      // Indicate that login succeeded.
      yield put({type: deps.loginSucceeded});
    }
    if (message.action === 'afterLogout') {
      yield put({type: deps.logoutSucceeded});
    }
  });

};
