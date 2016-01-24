import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from './misc';

import LoginScreen from './screens/login';
import JoinTeamScreen from './screens/join_team';
import MainScreen from './screens/main';
import RoundOverScreen from './screens/round_over';

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

    const {round} = self.props;

    if (round.status === 'open')
      return <MainScreen/>;

    if (round.status === 'over' || round.status === 'closed')
      return <RoundOverScreen/>;

    return <p>Cas non prévu.</p>

  };

});

export const selector = function (state) {
  const {crypto} = state;
  const {user, team, round} = state.response;
  const changed = crypto && crypto.changed;
  return {have_user: !!user, have_team: !!team, round, changed};
};

export default connect(selector)(App);
