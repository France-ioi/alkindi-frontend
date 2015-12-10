//
// Generic Tool stuff.
//

import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import toolRegistry from './tool-registry';
import * as actions from './actions';
import {PureComponent} from './misc';

// The generic Tool component, expecting the tool object as a property.
const BareTool = PureComponent(self => {
  const update = function (data) {
    self.props.dispatch(actions.updateTool(self.props.id, data));
  };
  self.render = function () {
    const {tool} = self.props;
    const props = {...self.props, update};
    const Component = tool.state.configuring ? tool.Configure : tool.Component;
    return (<Component {...props}/>);
  };
});
BareTool.propTypes = {
  id: React.PropTypes.string,
  tool: React.PropTypes.object,
  dispatch: React.PropTypes.func
};

// The Tool component uses its id property to look up the tool in the
// global state.
const toolSelectorFun = function (state, props) {
  return state.toolMap[props.id];
};
const toolSelector = createSelector(
  toolSelectorFun,
  function (tool) {
    return {tool};
  }
);
export const Tool = connect(toolSelector)(BareTool);

const defaultMergeState = function (state, update) {
  return {...state, ...update}; // default implementation?
};

export const newTool = function (toolType, toolState) {
  // Set defaults.
  const tool = {
    type: toolType,
    mergeState: defaultMergeState,
    outputScope: {}
  };
  // Call the factory.
  const factory = toolRegistry[toolType];
  factory(tool);
  // Set sane defaults for initial state.
  tool.state = {
    ...tool.state,
    collapsed: false,
    canRemove: true,
    canConfigure: true,
    configuring: false
  };
  // Merge the tool state if provided.
  if (toolState !== undefined)
    tool.state = tool.mergeState(tool.state, toolState);
  return tool;
};
