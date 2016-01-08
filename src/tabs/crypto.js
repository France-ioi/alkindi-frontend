import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'react-bootstrap';

import {PureComponent} from '../misc';
import {Tool} from '../tool';
import * as actions from '../actions';

const selector = function (state) {
  const {toolOrder, toolPointer} = state;
  return {
    toolOrder, toolPointer
  };
};

const CryptanalysisTab = PureComponent(self => {
  const addTool = function (event) {
    const toolType = event.currentTarget.getAttribute('data-tooltype');
    self.props.dispatch(actions.addTool(toolType));
  };
  self.render = function () {
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
});

export default connect(selector)(CryptanalysisTab);
