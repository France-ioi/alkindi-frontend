import React from 'react';

import {PureComponent} from '../misc';
import {logout} from '../api';

let AlkindiLogout = PureComponent(self => {
  const onLogout = function () {
    logout(function (err) {
      if (err) {
        // XXX display user notice
        return;
      }
      self.props.onLogout();
    });
  };
  self.render = function () {
    return (
      <div id="logout">
        <span>{self.props.username}</span>
        <button type='button' onClick={onLogout}>déconnexion</button>
      </div>
    );
  };
});

export default AlkindiLogout;
