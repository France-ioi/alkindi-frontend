import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from './misc';

import LoginScreen from './screens/login';
import JoinTeamScreen from './screens/join_team';
import MainScreen from './screens/main';

export const selector = function (state) {
  const {activeTabKey, enabledTabs, user, team, round, attempt, task, crypto, refresh} = state;
  if (!user)
    return {refresh};
  if (!team)
    return {user, round};
  const changed = crypto.changed;
  return {activeTabKey, enabledTabs, user, team, round, attempt, task, changed};
};

export const App = PureComponent(self => {
  const afterLogout = function () {
    // Reload the page after the user has logged out to obtain a new session
    // and CSRF token.
    window.location.reload();
  };
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
    const {user, team, round, refresh} = self.props;

    // Si on n'a pas d'utilisateur, on affiche l'écran de login.
    if (user === undefined)
      return <LoginScreen loginUrl={Alkindi.config.login_url} onLogin={refresh}/>;

    // Si l'utilisateur n'a pas d'équipe, on lui affiche l'écran de sélection /
    // création d'équipe.
    if (team === undefined)
      return <JoinTeamScreen user={user} round={round} logoutUrl={Alkindi.config.logout_url} onLogout={afterLogout}/>;

    // Sinon, on affiche l'écran principal.
    return <MainScreen user={user} team={team} round={round} logoutUrl={Alkindi.config.logout_url} onLogout={afterLogout}/>;

  };
});

export default connect(selector)(App);
