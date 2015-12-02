import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button, Input} from 'react-bootstrap';

import {updateTool} from '../actions';
import code from '../code';
import BareTextInput from '../ui/text';
import {importText} from '../values';

// TextInput is the normal tool's UI.
const TextInput = React.createClass({
  render: function () {
    const {input} = this.props.tool.compute;
    return (<textarea ref='input' value={input} onChange={this.onChange} />);
  },
  onChange: function (event) {
    const {id, dispatch} = this.props;
    const input = this.refs.input.value;
    dispatch(updateTool(id, {compute: {input: input}}));
  }
});

const ConfigureTextInput = React.createClass({
  getInitialState: function () {
    // Initialize our local state using the tool's settings.
    return {
      output: this.props.tool.output
    };
  },
  render: function () {
    // Read the settings from our local state.
    const {output} = this.state;
    // TODO: allow selecting the alphabet
    return (
      <div>
        <p>Output variable</p>
        <Input type='text' ref='output' value={output} label="Output variable" placeholder="Enter variable name" onChange={this.onChange} />
        <Button className='btn-primary pull-right' onClick={this.close}>Ok</Button>
      </div>
    );
  },
  onChange: function (event, key, value) {
    // Update our local state with the user's input.
    this.setState({output: this.refs.output.getValue()});
  },
  close: function (event) {
    // Exit configuration mode and update the tool's configuration.
    const {id, dispatch} = this.props;
    const {output} = this.state;
    dispatch(
      updateTool(id, {
        configuring: false,
        outputs: {
          output: output
        }
      }));
  }
});

const getDefaults = function () {
  return {
    compute: {
      input: '',            // text to import
      alphabet: undefined,  // alphabet to use for import
      qualifier: 'given'    // qualifier to apply to the symbols
    },
    outputs: {
      output: undefined     // name of the variable that receives the text
    }
  };
};

const getTitle = function (tool) {
  const maxTextLength = 20;
  const {compute, outputs} = tool;
  const {input} = compute;
  const {output} = outputs;
  const shortenedInput = (input.length > maxTextLength) ? input.slice(0, maxTextLength) + '…' : input;
  // TODO: include the alphabet in the display?
  return code.wrap([code.variable('1', output), ' = "', shortenedInput, '"']);
};

const compute = function (tool, inputs) {
  const {input, alphabet, qualifier} = tool.compute;
  const text = importText(alphabet, input, qualifier);
  return {
    output: text
  };
};

export default {
  normal: TextInput,
  configure: ConfigureTextInput,
  getDefaults,
  getTitle,
  compute
};
