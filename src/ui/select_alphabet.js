import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Input, DropdownButton, MenuItem} from 'react-bootstrap';

import alphabets from '../alphabets';
import {PureComponent} from '../misc';

const SelectAlphabet = PureComponent(self => {
  const onChange = function () {
    self.props.onChange(self.refs.input.getValue());
  };
  self.render = function () {
    const {value, label} = self.props;
    const options = Object.keys(alphabets).map(function (name) {
      const alphabet = alphabets[name];
      return (<option key={name} value={name}>{alphabet.name}</option>);
    });
    return (<Input ref='input' type="select" label={label} value={value} onChange={onChange}>{options}</Input>);
  };
});

SelectAlphabet.propTypes = {
  value: React.PropTypes.string,
  label: React.PropTypes.string,
  onChange: React.PropTypes.func.isRequired
};

export default SelectAlphabet;
