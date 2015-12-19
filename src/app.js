import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';

import {PureComponent} from './misc';
import AlkindiTabs from './ui/tabs';
import {Tool} from './tool';
import * as actions from './actions';

const appSelector = function (state) {
  const {toolOrder, toolPointer, activeTabKey, user, team, question} = state;
  return {
    toolOrder, toolPointer, activeTabKey, user, team, question
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
  const renderCryptanalysis = function () {
    const toolPointer = self.props.toolPointer;
    const tools = self.props.toolOrder.map(id => {
      return <div key={id} className='clearfix'><Tool id={id}/></div>;
    });
    const adders = ['TextDisplay', 'TextInput', 'SubstitutionInput', 'SubstitutionInputApply'].map(name => {
      return (
        <Button key={'+'+name} onClick={addTool} data-tooltype={name} >
          <i className="fa fa-plus"/> {name}
        </Button>);
    });
    return (
      <div>
        <p>PC = {toolPointer}</p>
        {tools}
        <ButtonGroup>{adders}</ButtonGroup>
      </div>
    );
  };
  const renderJoinTeam = function () {
    return (
      <div className="wrapper">
        <div id="auth-header">
          <table style={{width:'100%'}}><tbody><tr>
            <td style={{width:'20%'}}><img src="../images/alkindi-logo.png"/></td>
            <td>
              <h1 className="general_title">Concours Alkindi</h1>
              <h2 className="general_subtitle">Test alkindi</h2>
            </td>
          </tr></tbody></table>
        </div>
        <p>Pour accéder à l'inteface du concours, vous devez saisir le code d'équipe qui vous a été communiqué par un cammarade ou votre coordinateur.</p>
        <form method="" action="">
          <p className="input"><label htmlFor="code-equipe">Code d'équipe : </label><input type="text" id="code-equipe"/></p>
          <p><button type="submit">Rejoindre une équipe</button></p>
        </form>
      </div>
    );
  };
  self.render = function () {
    const {user, team, question, activeTabKey} = self.props;
    // Si l'utilisateur n'est pas sélectionné et qu'il n'a pas rejoint une
    // équipe, on lui affiche le composant de sélection d'équipe.
    if (!user.isSelected && !team)
      return renderJoinTeam();
    let content = false;
    switch (activeTabKey) {
      case 'cryptanalysis':
        content = renderCryptanalysis();
    }
    return (
      <div>
        <div id="header">
          <div className="wrapper">
            <img id="header-logo" src="https://s3-eu-west-1.amazonaws.com/static3.castor-informatique.fr/contestAssets/images/alkindi-logo.png" />
            <AlkindiTabs activeTabKey={activeTabKey} haveTeam={!!team} haveQuestion={!!question} setActiveTab={setActiveTab} />
          </div>
        </div>
        <div className="container">{content}</div>
      </div>);
  };
}));

export default App;
