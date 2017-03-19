
import React from 'react';
import {Alert, Button, FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {eventChannel, buffers} from 'redux-saga';
import {put, take, select, takeLatest, call} from 'redux-saga/effects'
import {default as ManagedProcess, getManagedProcessState} from './managed_process';

import AuthHeader from './ui/auth_header';
import getMessage from './messages';

export default function (bundle, deps) {

  bundle.use('getLoginUrl', 'getLogoutUrl', 'setCsrfToken', 'refresh');

  bundle.defineAction('login', 'Login');
  bundle.defineAction('loginFeedback', 'Login.Feedback'); // sent via client API
  bundle.defineAction('loginSucceeded', 'Login.Succeeded');
  bundle.defineAction('loginFailed', 'Login.Failed');
  bundle.defineAction('loginExpired', 'Login.Expired');

  bundle.defineAction('logout', 'Logout');
  bundle.defineAction('logoutFeedback', 'Logout.Feedback'); // sent via client API
  bundle.defineAction('logoutSucceeded', 'Logout.Succeeded');
  bundle.defineAction('logoutFailed', 'Logout.Failed');

  bundle.defineSelector('LoginScreenSelector', function (state) {
    const loginWithParticipationCode = getManagedProcessState(state, 'loginWithParticipationCode');
    return {loginWithParticipationCode};
  });

  bundle.defineView('AuthHeader', AuthHeader);

  bundle.defineView('LoginScreen', 'LoginScreenSelector', EpicComponent(self => {
    function onLogin () {
      self.props.dispatch({type: deps.login});
    }
    function onSubmitParticipationCode () {
      const {participationCode} = self.state;
      self.props.dispatch({type: deps.loginWithParticipationCode, code: participationCode});
    }
    function onParticipationCodeChanged (event) {
      const participationCode = event.currentTarget.value;
      self.setState({participationCode});
    }
    self.state = {
      participationCode: ""
    };
    function renderParticipationCode () {
      const {participationCode} = self.state;
      const {pending, error} = self.props.loginWithParticipationCode;
      return (
        <form>
          <FormGroup controlId="participation_code">
            <ControlLabel>
              {"Si vous avez un code de qualification pour le tour 3, vous pouvez l'entrer ici :"}
            </ControlLabel>
            <FormControl
              name="participationCode" value={participationCode}
              onChange={onParticipationCodeChanged}
              type="text" placeholder="code" />
          </FormGroup>
          <p>
            <Button onClick={onSubmitParticipationCode}>
              {"valider"}
              {pending &&
                <span>{' '}<i className="fa fa-spinner fa-spin"/></span>}
            </Button>
          </p>
          {error && <Alert bsStyle='danger'>{getMessage(error)}</Alert>}
        </form>
      );
    }
    self.render = function () {
      return (
        <div className="wrapper">
          <deps.AuthHeader/>
          <div className="section">
            <p>Bienvenue sur la plateforme des tours 2 et 3 du concours Alkindi.</p>
            <p>
              Pour accéder à l'interface du concours, connectez vous en cliquant
              sur ce bouton :
            </p>
            <p><Button onClick={onLogin}>se connecter</Button></p>
            {renderParticipationCode()}
          </div>
        </div>
      );
    };
  }));

  bundle.defineSelector('LogoutButtonSelector', function (state) {
    const {user} = state.response;
    return {user};
  });

  bundle.defineView('LogoutButton', 'LogoutButtonSelector', EpicComponent(self => {
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

  bundle.addSaga(function* () {
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

  bundle.addSaga(function* () {
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
  bundle.addSaga(function* () {
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

  bundle.addReducer('loginSucceeded', function (state, action) {
    const {userId} = action;
    return {...state, userId};
  });

  /* Handle logout messages posted by the backend via the client API. */
  bundle.addSaga(function* () {
    while (true) {
      var {error, csrf_token} = yield take(deps.logoutFeedback);
      if (error) {
        yield put({type: deps.logoutFailed, error});
      } else {
        yield put({type: deps.logoutSucceeded});
        if (csrf_token) {
          /* The CSRF token is updated when the user logs out. */
          yield put({type: deps.setCsrfToken, csrf_token});
        }
      }
    }
  });

  bundle.addReducer('logoutSucceeded', function (state, action) {
    // TODO: update enabledTabs
    return {...state, userId: undefined, request: {}, response: {}};
  });

  bundle.addSaga(function* () {
    // while (true) {
    yield take(deps.loginExpired);
    alert("Vous êtes déconnecté, reconnectez-vous pour continuer.");
    yield put({type: deps.login});
    // }
  });

  /* Participation code */

  bundle.include(ManagedProcess('loginWithParticipationCode', 'Login.ParticipationCode', p => function* (action) {
    const {code} = action;
    const api = yield select(state => state.api);
    let result;
    try {
      result = yield call(api.loginWithParticipationCode, {code});
    } catch (ex) {
      yield p.failure('server error');
      return;
    }
    if (result.success) {
      yield p.success();
      const {csrf_token, user_id} = result;
      yield put({type: deps.loginFeedback, csrf_token, user_id});
    } else {
      yield p.failure(result.error);
    }
  }));
  bundle.use('loginWithParticipationCode');

};
