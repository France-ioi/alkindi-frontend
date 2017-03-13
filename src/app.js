import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';

export default function (bundle, deps) {

  bundle.use(
    'LoginScreen', 'JoinTeamScreen', 'MainScreen', 'RoundOverScreen',
    'FinalScreen', 'RefreshButton');

  bundle.defineSelector('AppSelector', function (state) {
    const {crashed} = state;
    const {error, user, team, round} = state.response;
    if (error) {
      return {error};
    }
    /* TODO: restore this mechanism, set 'changed' to true when workspace
             has unsaved changes */
    const changed = false;
    /* Screen selection */
    let screen;
    if (!user) {
      screen = 'login';
    } else if (!team) {
      screen = 'join_team';
    } else if (round.status === 'open') {
      screen = 'main';
    } else if (round.status === 'over' || round.status === 'closed') {
      screen = state.bypassRoundOverScreen ? 'main' : 'round_over';
    } else if (round.status === 'final') {
      screen = 'final';
    }
    return {crashed, screen, changed};
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

      const {screen} = self.props;
      switch (screen) {
      case 'user': body = <deps.LoginScreen/>; break;
      case 'join_team': body = <deps.JoinTeamScreen/>; break;
      case 'main' : body = <deps.MainScreen/>; break;
      case 'round_over': body = <deps.RoundOverScreen/>; break;
      case 'final': body = <deps.FinalScreen/>; break;
      default:
        body = (
          <div>
            <p>Cas non prévu.</p>
          </div>
        );
        break;
      }

      return (
        <div>
          {popup}
          {body}
        </div>
      );
    };

  }));

};
