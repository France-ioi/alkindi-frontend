import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';

import {PureComponent} from './misc';
import AlkindiTabs from './ui/tabs';
import LoginScreen from './ui/login';
import AlkindiLogout from './ui/logout';
import QuestionTab from './ui/question_tab';
import TeamTab from './ui/team_tab';
import HistoryTab from './ui/history_tab';
import CryptanalysisTab from './ui/cryptanalysis_tab';
import JoinTeamScreen from './ui/join_team_screen';
import {Tool} from './tool';
import * as actions from './actions';
import * as api from './api';
import {image_url} from './assets';

const appSelector = function (state) {
  const {activeTabKey, user} = state;
  return {activeTabKey, user};
};

let App = connect(appSelector)(PureComponent(self => {
  const loadUser = function (user_id) {
    if (user_id === undefined)
      user_id = self.props.user.id;
    api.readUser(user_id, function (err, res) {
      if (err) return alert(err);
      const result = res.body;
      if ('user' in result) {
        const {user} = result;
        self.props.dispatch({type: 'SET_USER', user: user});
      }
    });
  };
  const afterLogin = function (user_id) {
    loadUser(user_id);
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
    const {user, activeTabKey} = self.props;
    const {team, round, question} = user || {};
    const haveTeam = !!team;
    console.log('here', user, team, question, round);
    const haveQuestion = question !== undefined && 'id' in question;
    if (user === undefined)
      return <LoginScreen loginUrl={Alkindi.config.login_url} onLogin={afterLogin} />;
    // Si l'utilisateur n'a pas d'équipe, on lui affiche l'écran de sélection /
    // création d'équipe.
    if (!haveTeam)
      return <JoinTeamScreen user={user} onLogout={afterLogout} reloadUser={loadUser} />;
    let content = false;
    switch (activeTabKey) {
      case 'question':
        content = <QuestionTab user={user} />;
        break;
      case 'cryptanalysis':
        content = <CryptanalysisTab/>;
        break;
      case 'answer':
        // content = <AnswerTab />;
        break;
      case 'team':
        content = <TeamTab user={user} team={team} haveQuestion={haveQuestion} reloadUser={loadUser} />;
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
            <AlkindiTabs activeTabKey={activeTabKey} haveTeam={haveTeam} haveQuestion={haveQuestion} setActiveTab={setActiveTab} />
            <AlkindiLogout user={user} logoutUrl={Alkindi.config.logout_url} onLogout={afterLogout} />
          </div>
        </div>
        <div className="wrapper">{content}</div>
      </div>);
  };
}));

export default App;
