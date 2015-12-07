import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Input, DropdownButton, MenuItem} from 'react-bootstrap';

import * as alphabets from './alphabets';
import {PureRenderMixin} from './misc';

export const SelectAlphabet = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    defaultValue: React.PropTypes.string,
    label: React.PropTypes.string
  },
  getDefaultProps: function () {
    defaultValue: 'select an alphabet'
  },
  render: function () {
    const alphabetNames = Object.keys(alphabets).sort();
    return (
      <Input ref='input' type="select" label={this.props.label} defaultValue={this.props.defaultValue}>
        {alphabetNames.map(name => <option key={name} value={name}>{name}</option>)}
      </Input>);
  },
  getValue: function () {
    return this.refs.input.getValue();
  }
});
