import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button, Input} from 'react-bootstrap';

import {updateTool} from '../actions';
import code from '../code';
import BareTextInput from '../ui/text';
import {importText} from '../values';
import * as alphabets from '../alphabets';
import {PureRenderMixin} from '../misc';

// TextInput is the normal tool's UI.
const TextInput = React.createClass({
  mixins: [PureRenderMixin],
  render: function () {
    const {compute, collapsed} = this.props.tool;
    const {input} = compute;
    const rows = collapsed ? 2 : 6;
    return (<textarea ref='input' className="full-width" rows={rows} value={input} onChange={this.onChange} />);
  },
  onChange: function (event) {
    const {id, dispatch} = this.props;
    const input = this.refs.input.value;
    dispatch(updateTool(id, {compute: {input: input}}));
  }
});

const ConfigureTextInput = React.createClass({
  mixins: [PureRenderMixin],
  render: function () {
    // Read the settings from our local state.
    const {output} = this.props.tool.outputs;
    // TODO: allow selecting the alphabet
    return (
      <div>
        <Input type='text' ref='output' label="Output variable" defaultValue={output} placeholder="Enter variable name" />
        <Button className='btn-primary pull-right' onClick={this.close}>Ok</Button>
      </div>
    );
  },
  close: function (event) {
    // Exit configuration mode and update the tool's configuration.
    const {id, dispatch} = this.props;
    const output = this.refs.output.getValue();
    const update = {
      configuring: false,
      outputs: {
        output
      }
    };
    dispatch(updateTool(id, update));
  }
});

const getDefaults = function () {
  return {
    compute: {
      input: '',            // text to import
      alphabet: alphabets.letters,  // alphabet to use for import
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
