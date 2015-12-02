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
const toolSelector = createSelector(
  toolSelectorFun,
  function (tool) {
    return {tool};
  }
);

export const Tool = connect(toolSelector)(React.createClass({
  propTypes: function () {
    return {
      id: React.PropTypes.string
    };
  },
  render: function () {
    const {type,canRemove,canConfigure,collapsed,invalidated,configuring} = this.props.tool;
    const mode = (canConfigure && configuring) ? 'configure' : 'normal';
    const rightButtons = [];
    if (canConfigure)
      rightButtons.push(<Button key="configure" onClick={this.configureClicked} active={configuring}><i className="fa fa-wrench"/></Button>);
    if (canRemove)
      rightButtons.push(<Button key="remove" onClick={this.removeClicked}><i className="fa fa-times"/></Button>);
    let inner = false, title;
    if (type in registry) {
      const toolSpec = registry[type];
      const Component = toolSpec[mode];  // JSX requires the uppercase first letter
      inner = (<Component {...this.props}/>);
      title = toolSpec.getTitle(this.props.tool);
    } else {
      title = "unknown tool type " + type;
    }
    let header = [
      (<Button key="collapse" onClick={this.collapseClicked} active={collapsed}><i className="fa fa-minus"></i></Button>), ' ',
      <span key="title">{title}</span>
    ];
    if (invalidated)
      header.push(<Label key="invalidated" bsStyle="warning">invalidated</Label>);
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
  // Build the (input variable → tool IDs) map.
  const inputMap = buildToolInputMap(state);
  // Invalidated tools are added to a map that will be merge into the tool map.
  const invalidatedToolMap = {};
  const queue = new Deque([id]);
  while (queue.length > 0) {
    id = queue.shift();
    // Do not invalidate the same tool twice — this should never happen!
    if (id in invalidatedToolMap) {
      console.log('invalidateTool avoided a cycle', JSON.dump({id, state}));
      continue;
    }
    // Mark the tool as invalidated in the new tool map.
    const tool = state.toolMap[id];
    invalidatedToolMap[id] = {...tool, invalidated: true};
    const outputs = tool.outputs;
    Object.keys(outputs).forEach(function (name) {
      const output = outputs[name];
      // Enqueue all tool IDs that take the ouput variable as an input.
      if (output in inputMap)
        queue.unshift(...inputMap[output]);
    });
  }
  // Install the new tool map.
  return {
    ...state,
    toolMap: {...state.toolMap, ...invalidatedToolMap}
  };
};

// Look up and return the input values for the specified tool, or undefined
// if any of the inputs is undefined.
export const lookupToolInputValues = function (tool, environment) {
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

// Compute and return the new output values for the specified tool.
// An empty object is return if the output values cannot be computed.
export const computeToolOutputValues = function (tool, inputValues) {
  const toolSpec = registry[tool.type];
  if (typeof inputValues === 'undefined')
    return {};
  return toolSpec.compute(tool, inputValues);
};

// Build a partial environment mapping a tool's output variables to the given
// output values.
export const buildToolOutputEnv = function (tool, outputValues) {
  const {outputs} = tool;
  const outputEnv = {};
  Object.keys(outputs).forEach(function (name) {
    const variable = outputs[name];
    const value = outputValues[name];
    outputEnv[variable] = value;
  });
  return outputEnv;
};

// Compute the tool's output in the given environment and return an update
// to the environment.
export const runTool = function (tool, environment) {
  const inputValues = lookupToolInputValues(tool, environment);
  const outputValues = computeToolOutputValues(tool, inputValues);
  return buildToolOutputEnv(tool, outputValues);
};
