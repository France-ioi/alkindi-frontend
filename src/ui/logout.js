import React from 'react';

import {PureComponent} from '../misc';

let AlkindiLogout = PureComponent(self => {
  const logout = function () {
    window.open(self.props.logoutUrl, "alkindi:login",
      "height=555, width=510, toolbar=yes, menubar=yes, scrollbars=no, resizable=no, location=no, directories=no, status=no");
  };
  const messageListener = function (event) {
    // TODO: understand why event.isTrusted is false on Firefox.
    const message = JSON.parse(event.data);
    if (message.action === 'afterLogout')
      self.props.onLogout(message.user);
  };
  self.componentDidMount = function () {
    window.addEventListener('message', messageListener);
  };
  self.componentWillUnmount = function () {
    window.removeEventListener('message', messageListener);
  };
  self.render = function () {
    const {username} = self.props.user;
    return (
      <div id="logout">
        <span>{username}</span>
        <button type='button' onClick={logout}>déconnexion</button>
      </div>
    );
  };
});

export default AlkindiLogout;
