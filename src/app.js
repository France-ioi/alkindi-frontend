import React from 'react';
import EpicComponent from 'epic-component';
import {use, defineSelector, defineView} from 'epic-linker';

import AuthHeader from './ui/auth_header';

export default function* (deps) {

  yield use('LoginScreen', 'JoinTeamScreen', 'MainScreen');

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
      const {user, team, round, showMainScreen, participation} = self.props;

      // The login screen is shown when no user is active.
      if (user === undefined) {
        return <deps.LoginScreen/>;
      }

      // Select the appropriate screen to display.
      let screen = false;
      if (team === undefined) {
        return <deps.JoinTeamScreen/>;
      }
      if (round.status === 'open' || showMainScreen || participation && participation.is_qualified) {
        return <deps.MainScreen/>;
      }

      /*
      if (round.status === 'final')
        return <deps.FinalScreen/>;
      if (round.status === 'over' || round.status === 'closed')
        return <deps.RoundOverScreen/>;
      */

      return (
        <div>
          <p>Cas non prévu.</p>
        </div>
      );
    };

  }));

};
