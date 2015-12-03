import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {DropdownButton, MenuItem} from 'react-bootstrap';

import * as alphabets from './alphabets';

export const SelectAlphabet = React.createClass({
  propTypes: {
    value: React.PropTypes.string,
    prefix: React.PropTypes.string
  },
  getDefaultProps: function () {
    return {
      prefix: 'single'
    };
  },
  getInitialState: function () {
    return {
      value: this.props.value
    };
  },
  render: function () {
    const id = this.props.prefix + '-select-alphabet';
    const {value} = this.state;
    const title = value in alphabets ? value : 'select an alphabet';
    const alphabetNames = Object.keys(alphabets).sort();
    return (
      <DropdownButton title={title} onSelect={this.onChange} id={id}>
        {alphabetNames.map(name => <MenuItem key={name} eventKey={name}>{name}</MenuItem>)}
      </DropdownButton>);
  },
  onChange: function (event, key) {
    this.setState({value: key});
  },
  getValue: function () {
    return this.state.value;
  }
});
