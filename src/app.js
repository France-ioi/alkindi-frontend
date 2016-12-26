import React from 'react';
import EpicComponent from 'epic-component';
import {use, defineSelector, defineView} from 'epic-linker';

//import MainScreen from './screens/main';
//import RoundOverScreen from './screens/round_over';
//import FinalScreen from './screens/final';

export default function* (deps) {

  yield use('LoginScreen', 'JoinTeamScreen');

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
        screen = <deps.JoinTeamScreen/>;
      }
      /*
      else if (round.status === 'open' || showMainScreen || participation && participation.is_qualified)
        screen = <deps.MainScreen/>;
      else if (round.status === 'final')
        screen = <deps.FinalScreen/>;
      else if (round.status === 'over' || round.status === 'closed')
        screen = <deps.RoundOverScreen/>;
      */
      else {
        screen = <p>Cas non prévu.</p>;
      }

/*
      TODO: add common elements:
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <Logout alkindi={alkindi}/>
        </div>
        <AuthHeader/>
        <Notifier emitter={alkindi.api.emitter}/>
*/
      return (
        <div>
          {screen}
        </div>
      );

    };

  }));

};
