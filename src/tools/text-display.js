import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button} from 'react-bootstrap';

import {SelectVariable} from '../select_variable';
import {updateTool} from '../actions';
import code from '../code';
import BareTextDisplay from '../ui/text';
import {PureRenderMixin} from '../misc';

// TextDisplay is the normal tool's UI.
const TextDisplay = React.createClass({
  mixins: [PureRenderMixin],
  render: function () {
    const {collapsed} = this.props.tool;
    const nLines = collapsed ? 2 : 10;
    const input = this.props.inputs.input;
    return (
      <div>
        <BareTextDisplay text={input} lines={nLines} />
      </div>);
  }
});

const ConfigureTextDisplay = React.createClass({
  mixins: [PureRenderMixin],
  render: function () {
    // Read the settings from our local state.
    const {input} = this.props.tool.inputs;
    return (
      <div>
        <p>Input variable</p>
        <SelectVariable ref='input' type='text' defaultValue={input} />
        <Button className='btn-primary pull-right' onClick={this.close}>Ok</Button>
      </div>
    );
  },
  close: function (event) {
    // Exit configuration mode and update the tool's input variable.
    const {id, dispatch} = this.props;
    // XXX figure out how to get connect() to proxy getValue()
    const input = this.refs.input.getWrappedInstance().getValue();
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
  normal: TextDisplay,
  configure: ConfigureTextDisplay,
  getDefaults,
  getTitle,
  compute
};
