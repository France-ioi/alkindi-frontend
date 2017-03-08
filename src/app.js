import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';

export default function (bundle, deps) {

  bundle.use('LoginScreen', 'JoinTeamScreen', 'MainScreen', 'RefreshButton', 'FinalScreen');

  bundle.defineSelector('AppSelector', function (state) {
    const {crashed} = state;
    const {error, user, team, round, participations, is_admin} = state.response;
    if (error) {
      return {error};
    }
    const {workspace, showMainScreen} = state; // XXX clean up
    const changed = workspace && workspace.changed;
    let currentParticipation = null;
    if (participations) {
      participations.forEach(function (participation) {
        if (participation.is_current)
          currentParticipation = participation;
      });
    }
    return {crashed, user, team, round, is_admin, changed, showMainScreen, participation: currentParticipation};
  });

  bundle.defineView('App', 'AppSelector', EpicComponent(self => {

    self.componentWillMount = function () {
      window.addEventListener('beforeunload', function (event) {
        if (self.props.changed) {
          const confirmMessage = "Vous avez des changements pas enregistrés qui seront perdus si vous quittez ou rechargez la page.";
          (event || window.event).returnValue = confirmMessage;
          return confirmMessage;
        }
      });
    };

    const onRetry = function () {
      // Restart the sagas.
      window.Alkindi.restart();
    };

    self.render = function () {
      let body = false, popup = false;
      const {crashed, error} = self.props;

      if (crashed) {
        popup = (
          <div id="popup">
            <Alert bsStyle='danger'>
              {"Désolé, une erreur s'est produite."}
            </Alert>
            <p className="text-center">
              <Button onClick={onRetry}>continuer</Button>
            </p>
          </div>
        );
      } else if (error) {
        popup = (
          <div id="popup">
            <p>Désolé, une erreur s'est produite : {error}</p>
            <p><deps.RefreshButton/></p>
          </div>
        );
      }

      const {user, team, round, showMainScreen, participation} = self.props;

      // The login screen is shown when no user is active.
      if (!user) {
        body = <deps.LoginScreen/>;
      } else if (!team) {
        body = <deps.JoinTeamScreen/>;
      } else if (round.status === 'open' || showMainScreen || participation && participation.is_qualified) {
        body = <deps.MainScreen/>;
      } else if (round.status === 'over') {
        body = <deps.FinalScreen status='over'/>;
      } else {
        body = (
          <div>
            <p>Cas non prévu.</p>
          </div>
        );
      }
      /*
      } else if (round.status === 'final') {
        return <deps.FinalScreen/>;
      } else if (round.status === 'over' || round.status === 'closed') {
        return <deps.RoundOverScreen/>;
      }
      */

      return (
        <div>
          {popup}
          {body}
        </div>
      );
    };

  }));

};
