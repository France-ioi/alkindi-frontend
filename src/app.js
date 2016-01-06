import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';

import {PureComponent} from './misc';
import AlkindiTabs from './ui/tabs';
import LoginScreen from './ui/login';
import AlkindiLogout from './ui/logout';
import TaskTab from './ui/task_tab';
import TeamTab from './ui/team_tab';
import HistoryTab from './ui/history_tab';
import CryptanalysisTab from './ui/cryptanalysis_tab';
import JoinTeamScreen from './ui/join_team_screen';
import {Tool} from './tool';
import * as actions from './actions';
import * as api from './api';
import {image_url} from './assets';

const appSelector = function (state) {
  const {activeTabKey, enabledTabs, user, team, round, attempt, task} = state;
  if (!user)
    return {};
  if (!team)
    return {user, round};
  return {activeTabKey, enabledTabs, user, team, round, attempt, task};
};

let App = connect(appSelector)(PureComponent(self => {
  const reseed = function (user_id) {
    if (user_id === undefined)
      user_id = self.props.user.id;
    api.readUser(user_id, function (err, res) {
      if (err) return alert(err);
      self.props.dispatch({type: 'INIT', seed: res.body});
    });
  };
  const afterLogin = function (user_id) {
    reseed(user_id);
  };
  const afterLogout = function () {
    // Reload the page after the user has logged out to obtain a new session
    // and CSRF token.
    window.location.reload();
  };
  const setActiveTab = function (tabKey) {
    self.props.dispatch(actions.setActiveTab(tabKey));
  };
  const addTool = function (event) {
    const toolType = event.currentTarget.getAttribute('data-tooltype');
    self.props.dispatch({type: 'ADD_TOOL', toolType});
  };
  self.render = function () {
    // Si on n'a pas d'utilisateur, on affiche l'écran de login.
    const {user} = self.props;
    if (user === undefined)
      return <LoginScreen loginUrl={Alkindi.config.login_url} onLogin={reseed} />;
    // Si l'utilisateur n'a pas d'équipe, on lui affiche l'écran de sélection /
    // création d'équipe.
    const {team} = self.props;
    if (team === undefined) {
      const {round} = self.props;
      return <JoinTeamScreen user={user} round={round} onLogout={afterLogout} onJoinTeam={reseed} />;
    }
    // Interface principale...
    const {activeTabKey, enabledTabs, round, attempt, task} = self.props;
    let content = false;
    switch (activeTabKey) {
      case 'task':
        content = <TaskTab round={round} attempt={attempt} task={task} />;
        break;
      case 'cryptanalysis':
        content = <CryptanalysisTab/>;
        break;
      case 'answer':
        // content = <AnswerTab />;
        break;
      case 'team':
        content = <TeamTab reseed={reseed} />;
        break;
      case 'history':
        content = <HistoryTab/>;
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
