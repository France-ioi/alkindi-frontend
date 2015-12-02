import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button} from 'react-bootstrap';

import {lookupInputVar, SelectVariable} from '../environment';
import {updateTool} from '../actions';
import code from '../code';
import BareTextDisplay from '../ui/text';

// The selector looks up the configured input variable in the environment,
// and passes the value to the TextDisplay component in property named 'input'.
const selTextDisplay = createSelector(
  lookupInputVar('input'),
  function (input) {
    return {input};
  }
);

// TextDisplay is the normal tool's UI.
const TextDisplay = React.createClass({
  render: function () {
    const {input, collapsed} = this.props;
    const nLines = collapsed ? 2 : 10;
    return (
      <div>
        <BareTextDisplay text={input} lines={nLines} />
      </div>);
  }
});

const ConfigureTextDisplay = React.createClass({
  getInitialState: function () {
    // Initialize our local state using the tool's settings.
    return {
      input: this.props.tool.inputs.input
    };
  },
  render: function () {
    // Read the settings from our local state.
    const {input} = this.state;
    return (
      <div>
        <p>Input variable</p>
        <SelectVariable type='text' value={input} eventKey='input' onSelect={this.onSelect} />
        <Button className='btn-primary pull-right' onClick={this.close}>Ok</Button>
      </div>
    );
  },
  onSelect: function (event, key, value) {
    // Update our local state with the user's input.
    this.setState({[key]: value});
  },
  close: function (event) {
    // Exit configuration mode and update the tool's input variable.
    const {id, dispatch} = this.props;
    const {input} = this.state;
    dispatch(updateTool(id, {
      configuring: false,
      inputs: {input}
    }));
  }
});

const getDefaults = function () {
  return {
    inputs: {
      input: undefined
    }
  };
};

const getTitle = function (tool) {
  return code.wrap([
    code.keyword('0', 'print'),
    '(', code.variable('1', tool.inputs.input), ')'
  ]);
};

const compute = function (inputs, settings, state) {
  return {};
};

export default {
  normal: connect(selTextDisplay)(TextDisplay),
  configure: ConfigureTextDisplay,
  getDefaults,
  getTitle,
  compute
};
