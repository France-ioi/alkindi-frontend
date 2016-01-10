import React from 'react';

import {PureComponent} from '../misc';
import AlkindiAuthHeader from '../ui/auth_header';

const LoginScreen = PureComponent(self => {
  let loginWindow;
  const login = function () {
    if (loginWindow !== undefined) {
      loginWindow.close();
      loginWindow = undefined;
    }
    const {loginUrl} = self.props;
    loginWindow = window.open(loginUrl, "alkindi:login",
      "height=555, width=510, toolbar=yes, menubar=yes, scrollbars=no, resizable=no, location=no, directories=no, status=no");
  };
  const messageListener = function (event) {
    // TODO: understand why event.isTrusted is false on Firefox.
    const message = JSON.parse(event.data);
    if (message.action === 'afterLogin')
      self.props.onLogin(message.user_id);
  };
  self.componentDidMount = function () {
    window.addEventListener('message', messageListener);
  };
  self.componentWillUnmount = function () {
    window.removeEventListener('message', messageListener);
  };
  self.render = function () {
    return (
      <div className="wrapper">
        <AlkindiAuthHeader/>
        <div>
          <p>Pour continuer, authentifiez-vous auprès de la plateforme France-IOI
          en cliquant sur le bouton ci-dessous.</p>
          <p><button className="btn btn-primary" onClick={login}>se connecter</button></p>
        </div>
      </div>
    );
  };
});

export default LoginScreen;
