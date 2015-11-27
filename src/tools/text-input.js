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
  propTypes: {
    id: React.PropTypes.string,
    settings: React.PropTypes.object
  },
  render: function () {
    const {value} = this.props.settings;
    return (
      <div>
        <BareTextInput text={value} editable setText={this.setText} />
      </div>);
  },
  setText: function (text, event) {
    const {id, settings} = this.props;
    this.props.dispatch(
      updateTool(id, {
        settings: {...settings, value: text}
      }));
  }
});

const ConfigureTextInput = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    settings: React.PropTypes.object
  },
  getInitialState: function () {
    // Initialize the state from the settings prop.
    return this.props.settings;
  },
  render: function () {
    // Read the settings from our local state.
    const {output} = this.state;
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
    this.setState(function (state) {
      return {...state, output: this.refs.output.getValue()};
    });
  },
  close: function (event) {
    // Exit configuration mode and update the tool's settings.
    this.props.dispatch(
      updateTool(this.props.id, {
        state: {configuring: false},
        settings: this.state
      }));
  }
});

const buildTitle = function (props) {
  return code.wrap([code.variable('1', props.settings.output), ' = (text)']);
};

export default {
  normal: TextInput,
  configure: ConfigureTextInput,
  buildTitle: buildTitle,
  getDefaultSettings: function (state) {
    return {
      output: '_',
      value: importText(state.alphabets.letters, '', 'input')
    };
  }
};
