import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from './misc';
import LoginScreen from './ui/login';
import AlkindiLogout from './ui/logout';
import AlkindiTabs from './ui/tabs';
import TaskTab from './tabs/task';
import TeamTab from './tabs/team';
import PlayFairTab from './tabs/playfair';
import HistoryTab from './tabs/history';
import AnswersTab from './tabs/answers';
import JoinTeamScreen from './ui/join_team_screen';
import * as actions from './actions';
import * as api from './api';
import {image_url} from './assets';

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
    api.readUser(user_id, function (err, res) {
      if (err) return alert(err);
      self.props.dispatch({type: 'INIT', seed: res.body});
    });
  };
  const afterLogout = function () {
    // Reload the page after the user has logged out to obtain a new session
    // and CSRF token.
    window.location.reload();
  };
  const setActiveTab = function (tabKey) {
    self.props.dispatch(actions.setActiveTab(tabKey));
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
    // Si on n'a pas d'utilisateur, on affiche l'écran de login.
    const {user} = self.props;
    if (user === undefined)
      return <LoginScreen loginUrl={Alkindi.config.login_url} onLogin={refresh} />;
    // Si l'utilisateur n'a pas d'équipe, on lui affiche l'écran de sélection /
    // création d'équipe.
    const {team} = self.props;
    if (team === undefined) {
      const {round} = self.props;
      return <JoinTeamScreen user={user} round={round} onLogout={afterLogout} onJoinTeam={refresh} />;
    }
    // Interface principale...
    const {activeTabKey, enabledTabs, round, attempt, task} = self.props;
    let content = false;
    switch (activeTabKey) {
      case 'task':
        content = <TaskTab round={round} attempt={attempt} task={task} />;
        break;
      case 'cryptanalysis':
        content = <PlayFairTab refresh={refresh} />;
        break;
      case 'team':
        content = <TeamTab refresh={refresh} />;
        break;
      case 'history':
        content = <HistoryTab/>;
        break;
      case 'answers':
        content = <AnswersTab/>;
        break;
    }
    return (
      <div>
        <div id="header">
          <div className="wrapper">
            <img id="header-logo" src={image_url('alkindi-logo.png')} />
            <AlkindiTabs activeTabKey={activeTabKey} enabledTabs={enabledTabs} setActiveTab={setActiveTab} />
            <AlkindiLogout user={user} logoutUrl={Alkindi.config.logout_url} onLogout={afterLogout} />
          </div>
        </div>
        <div className="wrapper">{content}</div>
      </div>);
  };
}));

export default App;
