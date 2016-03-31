import React from 'react';
import EpicComponent from 'epic-component';
import {connect} from 'react-redux';

import LoginScreen from './screens/login';
import JoinTeamScreen from './screens/join_team';
import MainScreen from './screens/main';
import RoundOverScreen from './screens/round_over';
import FinalScreen from './screens/final';

export const App = EpicComponent(self => {

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
    const {user, team, round, showMainScreen} = self.props;

    if (user === undefined)
      return <LoginScreen user={user} round={round}/>;

    if (team === undefined)
      return <JoinTeamScreen/>;

    if (round.status === 'open' || showMainScreen || participation.is_qualified)
      return <MainScreen/>;

    if (round.status === 'final')
      return <FinalScreen/>;

    if (round.status === 'over' || round.status === 'closed')
      return <RoundOverScreen/>;

    return <p>Cas non prévu.</p>;

  };

});

export const selector = function (state) {
  const {user, team, round, participations, is_admin} = state.response;
  const {workspace, showMainScreen} = state; // XXX clean up
  const changed = workspace && workspace.changed;
  let currentParticipation = null;
  participations.forEach(function (participation) {
    if (participation.is_current)
      currentParticipation = participation;
  });
  return {user, team, round, is_admin, changed, showMainScreen, participation};
};

export default connect(selector)(App);
