import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from './misc';

import LoginScreen from './screens/login';
import JoinTeamScreen from './screens/join_team';
import MainScreen from './screens/main';

export const App = PureComponent(self => {

  self.componentWillMount = function () {
    window.addEventListener('beforeunload', function (event) {
      if (self.props.changed) {
        const confirmMessage = "Vous avez des changements pas enregistrés qui seront perdus si vous quittez ou rechargez la page.";
        (event || window.event).returnValue = confirmMessage;
        return confirmMessage;
      }
    });
  };

  self.render = function () {
    const {have_user, have_team} = self.props;

    if (!have_user)
      return <LoginScreen/>;

    if (!have_team)
      return <JoinTeamScreen/>;

    return <MainScreen/>;
  };

});

export const selector = function (state) {
  const {crypto} = state;
  const {user, team} = state.response;
  const changed = crypto && crypto.changed;
  return {have_user: !!user, have_team: !!team, changed};
};

export default connect(selector)(App);
