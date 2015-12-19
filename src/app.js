import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';

import {PureComponent} from './misc';
import AlkindiTabs from './ui/tabs';
import CryptanalysisTab from './ui/cryptanalysis_tab';
import JoinTeamScreen from './ui/join_team_screen';
import {Tool} from './tool';
import * as actions from './actions';

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
      return <JoinTeamScreen/>;
    let content = false;
    switch (activeTabKey) {
      case 'cryptanalysis':
        content = <CryptanalysisTab/>;
    }
    return (
      <div>
        <div id="header">
          <div className="wrapper">
            <img id="header-logo" src="https://s3-eu-west-1.amazonaws.com/static3.castor-informatique.fr/contestAssets/images/alkindi-logo.png" />
            <AlkindiTabs activeTabKey={activeTabKey} haveTeam={!!team} haveQuestion={!!question} setActiveTab={setActiveTab} />
          </div>
        </div>
        <div className="wrapper">{content}</div>
      </div>);
  };
}));

export default App;
