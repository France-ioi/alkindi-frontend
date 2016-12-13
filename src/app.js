import React from 'react';
import EpicComponent from 'epic-component';
import {use, defineSelector, defineView} from 'epic-linker';

//import JoinTeamScreen from './screens/join_team';
//import MainScreen from './screens/main';
//import RoundOverScreen from './screens/round_over';
//import FinalScreen from './screens/final';

export default function* (deps) {

  yield use('LoginScreen');

  yield defineSelector('AppSelector', function (state) {
    const {user, team, round, participations, is_admin} = state.response;
    const {workspace, showMainScreen} = state; // XXX clean up
    const changed = workspace && workspace.changed;
    let currentParticipation = null;
    if (participations) {
      participations.forEach(function (participation) {
        if (participation.is_current)
          currentParticipation = participation;
      });
    }
    return {user, team, round, is_admin, changed, showMainScreen, participation: currentParticipation};
  });

  yield defineView('App', 'AppSelector', EpicComponent(self => {

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
      const {alkindi, user, team, round, showMainScreen, participation} = self.props;

      if (user === undefined)
        return <deps.LoginScreen/>;

      /*
      if (team === undefined)
        return <JoinTeamScreen alkindi={alkindi}/>;

      if (round.status === 'open' || showMainScreen || participation && participation.is_qualified)
        return <MainScreen alkindi={alkindi}/>;

      if (round.status === 'final')
        return <FinalScreen alkindi={alkindi}/>;

      if (round.status === 'over' || round.status === 'closed')
        return <RoundOverScreen alkindi={alkindi}/>;
      */

      return <p>Cas non prévu.</p>;

    };

  }));

};
