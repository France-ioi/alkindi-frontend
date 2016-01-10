import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from './misc';
import {BareApi} from './api';

import LoginScreen from './screens/login';
import JoinTeamScreen from './screens/join_team';
import MainScreen from './screens/main';

const appSelector = function (state) {
  const {activeTabKey, enabledTabs, user, team, round, attempt, task, crypto} = state;
  if (!user)
    return {};
  if (!team)
    return {user, round};
  const changed = crypto.changed;
  return {activeTabKey, enabledTabs, user, team, round, attempt, task, changed};
};

let App = connect(appSelector)(PureComponent(self => {
  const refresh = function (user_id) {
    if (user_id === undefined)
      user_id = self.props.user.id;
    BareApi.readUser(user_id).end(function (err, res) {
      if (err) return alert(err);
      self.props.dispatch({type: 'INIT', seed: res.body});
    });
  };
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
    const {user, team, round} = self.props;

    // Si on n'a pas d'utilisateur, on affiche l'écran de login.
    if (user === undefined)
      return <LoginScreen loginUrl={Alkindi.config.login_url} onLogin={refresh} />;

    // Si l'utilisateur n'a pas d'équipe, on lui affiche l'écran de sélection /
    // création d'équipe.
    if (team === undefined)
      return <JoinTeamScreen user={user} round={round} refresh={refresh} logoutUrl={Alkindi.config.logout_url} onLogout={afterLogout}/>;

    // Sinon, on affiche l'écran principal.
    return <MainScreen user={user} team={team} round={round} refresh={refresh} logoutUrl={Alkindi.config.logout_url} onLogout={afterLogout}/>;

  };
}));

export default App;
