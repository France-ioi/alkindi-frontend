import React from 'react';
import {connect} from 'react-redux';
import {Button} from 'react-bootstrap';

import {PureComponent} from '../misc';

export const LogoutButton = PureComponent(self => {
  self.render = function () {
    const {username} = self.props.user;
    return (
      <div id="logout">
        <span>{username}</span>
        <Button onClick={Alkindi.logout}>déconnexion</Button>
      </div>
    );
  };
});

export const selector = function (state) {
  const {user} = state.response;
  return {user};
};

export default connect(selector)(LogoutButton);
