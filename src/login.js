
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
            <p>Bienvenue sur la plateforme du 2e tour du concours Alkindi.</p>
          </div>
          <div className="section">
            <h2>Si vous avez déjà créé votre compte</h2>
            <p>Authentifiez-vous auprès de la plateforme France-ioi en cliquant
               sur le bouton ci-dessous.</p>
            <p><Button onClick={onLogin}>se connecter</Button></p>
          </div>
          <div className="section">
            <h2>Sinon, deux cas sont possibles :</h2>
            <div className="section">
              <h3>Vous êtes qualifié(e) suite au premier tour et disposez d'un code de qualification</h3>
              <p>
                {'Commencez par valider votre code de qualification et créer un compte France-ioi sur '}
                <a href="http://qualification.concours-alkindi.fr" target="new">
                  {'qualification.concours-alkindi.fr'}
                </a>
                {', puis revenez vous connecter sur cette page.'}
              </p>
            </div>
            <div className="section">
              <h3>Vous n'êtes pas qualifié(e) ou n'aviez pas participé</h3>
              <p>Vous pouvez rejoindre une équipe si vous avez un(e) camarade qualifié(e) qui vous y invite (la moitié au moins de l'équipe doit être qualifiée).</p>
              <p>Pour cela, cliquez sur le bouton suivant pour créez un compte.</p>
              <p><Button onClick={onLogin}>créer son compte</Button></p>
              <p>Choisissez "Mot de passe" dans la première popup, puis "Créer un compte", et choisissez un login et un mot de passe pour vous authentifier.</p>
              <p>Une fois connecté, vous pourrez rejoindre une équipe en fournissant le code transmis par vos camarades.</p>
            </div>
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
