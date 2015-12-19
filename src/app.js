import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';

import {PureComponent} from './misc';
import AlkindiTabs from './ui/tabs';
import {Tool, newTool} from './tool';
import * as values from './values';
import * as alphabets from './alphabets';

const appSelector = function (state) {
  const {toolOrder, toolPointer, activeTabKey} = state;
  return {
    toolOrder, toolPointer, activeTabKey
  };
};

let App = connect(appSelector)(PureComponent(self => {
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
  self.render = function () {
    const {activeTabKey} = self.props;
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
            <AlkindiTabs/>
          </div>
        </div>
        <div className="container">{content}</div>
      </div>);
  };
}));

export default App;
