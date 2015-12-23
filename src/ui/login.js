import React from 'react';

import {PureComponent} from '../misc';
import AlkindiAuthHeader from './auth_header';

const LoginScreen = PureComponent(self => {
  const messageListener = function (event) {
    if (!event.isTrusted)
      return;
    const message = JSON.parse(event.data);
    if (message.action === 'afterLogin')
      self.props.onLogin(message.user);
  };
  const login = function () {
    window.open(self.props.loginUrl, "alkindi:login",
      "height=555, width=510, toolbar=yes, menubar=yes, scrollbars=no, resizable=no, location=no, directories=no, status=no");
  };
  self.componentDidMount = function () {
    window.addEventListener('message', messageListener);
  };
  self.componentWillUnmount = function () {
    window.removeEventListener('message', messageListener);
  };
  self.render = function () {
    const {loginUrl} = self.props;
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
