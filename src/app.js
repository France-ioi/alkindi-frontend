import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';

import {PureComponent} from './misc';
import AlkindiTabs from './ui/tabs';
import AlkindiLogout from './ui/logout';
import TeamTab from './ui/team_tab';
import HistoryTab from './ui/history_tab';
import CryptanalysisTab from './ui/cryptanalysis_tab';
import JoinTeamScreen from './ui/join_team_screen';
import {Tool} from './tool';
import * as actions from './actions';
import {image_url} from './assets';

const appSelector = function (state) {
  const {activeTabKey, user, team, question} = state;
  return {
    activeTabKey, user, team, question
  };
};

let App = connect(appSelector)(PureComponent(self => {
  const setActiveTab = function (tabKey) {
    self.props.dispatch(actions.setActiveTab(tabKey));
  };
  const addTool = function (event) {
    const toolType = event.currentTarget.getAttribute('data-tooltype');
    self.props.dispatch({type: 'ADD_TOOL', toolType});
  };
  self.render = function () {
    const {user, team, question, activeTabKey} = self.props;
    // Si l'utilisateur n'est pas sélectionné et qu'il n'a pas rejoint une
    // équipe, on lui affiche l'écran de sélection d'équipe.
    if (!user.isSelected && !team)
      return <JoinTeamScreen user={user} />;
    let content = false;
    switch (activeTabKey) {
      case 'team':
        content = <TeamTab user={user} team={team} haveQuestion={!!question}/>;
        break;
      case 'history':
        // FIXME: we do not always need workspaces, so make the component
        // connect directly to the store.
        content = <HistoryTab/>;
        break;
      case 'cryptanalysis':
        content = <CryptanalysisTab/>;
        break;
    }
    return (
      <div>
        <div id="header">
          <div className="wrapper">
            <img id="header-logo" src={image_url('alkindi-logo.png')} />
            <AlkindiTabs activeTabKey={activeTabKey} haveTeam={!!team} haveQuestion={!!question} setActiveTab={setActiveTab} />
            <AlkindiLogout username={user.email}/>
          </div>
        </div>
        <div className="wrapper">{content}</div>
      </div>);
  };
}));

export default App;
