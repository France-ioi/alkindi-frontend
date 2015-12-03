// Tool user interface.

import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button, ButtonGroup, Panel, Label} from 'react-bootstrap';
import deepmerge from 'deepmerge';
import Deque from 'collections/deque';

import registry from './tool-registry';
import {removeTool, updateTool} from './actions';

const toolSelectorFun = function (state, props) {
  return state.toolMap[props.id];
};
const inputsSelectorFun = function (state, props) {
  return state.toolInputs[props.id];
};
const outputsSelectorFun = function (state, props) {
  return state.toolOutputs[props.id];
};
const needRefreshSelectorFun = function (state, props) {
  return state.refreshMap[props.id];
};
const toolSelector = createSelector(
  toolSelectorFun,
  inputsSelectorFun,
  outputsSelectorFun,
  needRefreshSelectorFun,
  function (tool, inputs, outputs, needRefresh) {
    return {tool, inputs, outputs, needRefresh};
  }
);

export const Tool = connect(toolSelector)(React.createClass({
  propTypes: function () {
    return {
      id: React.PropTypes.string
    };
  },
  render: function () {
    console.log('render', this.props.id);
    const {tool, inputs, outputs, needRefresh} = this.props;
    const {type,canRemove,canConfigure,collapsed,configuring} = this.props.tool;
    const mode = (canConfigure && configuring) ? 'configure' : 'normal';
    const rightButtons = [];
    if (canConfigure)
      rightButtons.push(<Button key="configure" onClick={this.configureClicked} active={configuring}><i className="fa fa-wrench"/></Button>);
    if (canRemove)
      rightButtons.push(<Button key="remove" onClick={this.removeClicked}><i className="fa fa-times"/></Button>);
    let title, inner;
    if (type in registry) {
      const toolSpec = registry[type];
      title = toolSpec.getTitle(tool);
      const Component = toolSpec[mode];  // JSX requires the uppercase first letter
      if (configuring || inputs)
        inner = (<Component {...this.props}/>);
    } else {
      title = "unknown tool type " + type;
      inner = false;
    }
    const header = [
      (<Button key="collapse" onClick={this.collapseClicked} active={collapsed}><i className="fa fa-minus"></i></Button>), ' ',
      <span key="title">{title}</span>
    ];
    if (needRefresh)
      header.push(<Label key="invalidated" bsStyle="warning">refresh</Label>);
    header.push(<ButtonGroup key="rightButtons" className="pull-right">{rightButtons}</ButtonGroup>);
    return (<Panel header={header}>{inner}</Panel>);
  },
  collapseClicked: function () {
    this.props.dispatch(
      updateTool(this.props.id, {collapsed: !this.props.tool.collapsed}));
  },
  configureClicked: function () {
    this.props.dispatch(
      updateTool(this.props.id, {configuring: !this.props.tool.configuring}));
  },
  removeClicked: function () {
    this.props.dispatch(removeTool(this.props.id));
  }
}));

export const newTool = function (type) {
  let result = {
    type: type,
    display: {},
    compute: {},
    inputs: {},
    outputs: {}
  };
  if (type in registry) {
    result = deepmerge(result, registry[type].getDefaults());
  }
  return result;
};

// Build a map from variable name to a list of tool IDs that use that
// variable as an input.
function buildToolInputMap (state) {
  const map = {};
  Object.keys(state.toolMap).forEach(function (id) {
    const tool = state.toolMap[id];
    const inputs = tool.inputs;
    Object.keys(inputs).forEach(function (input) {
      const variable = inputs[input];
      if (variable in map)
        map[variable].push(id);
      else
        map[variable] = [id];
    });
  });
  return map;
}

export const invalidateTool = function (state, id) {
  console.log('invalidate', id);
  // Build the (input variable → tool IDs) map.
  const inputMap = buildToolInputMap(state);
  // Invalidated tools are added to a map that will be merged into the tool map.
  const refreshMap = {...state.refreshMap};
  const queue = new Deque([id]);
  while (queue.length > 0) {
    id = queue.shift();
    // Set the refresh flag.
    refreshMap[id] = true;
    // Cascade invalidation to outputs.
    const tool = state.toolMap[id];
    const outputs = tool.outputs;
    Object.keys(outputs).forEach(function (name) {
      const output = outputs[name];
      // Enqueue all tool IDs that take the ouput variable as an input.
      if (output in inputMap)
        queue.unshift(...inputMap[output]);
    });
  }
  // Install the new tool map.
  return {...state, refreshMap};
};

// Look up and return the input values for the specified tool, or undefined
// if any of the inputs is undefined.
export const lookupToolInputs = function (tool, environment) {
  const {inputs} = tool;
  const inputValues = {};
  let haveUndefined = false;
  Object.keys(inputs).forEach(function (name) {
    const variable = inputs[name];
    const value = environment[variable];
    if (typeof value === 'undefined')
      haveUndefined = true;
    inputValues[name] = value;
  });
  // If any of the input values is undefined we set all the outputs to undefined.
  return haveUndefined ? void 0 : inputValues;
};

// Compute and return the tool's output values, using the given input values.
export const computeToolOutputs = function (tool, inputValues) {
  if (typeof inputValues === 'undefined')
    return {};
  const toolSpec = registry[tool.type];
  return toolSpec.compute(tool, inputValues);
};
