import React from 'react';
import {Input} from 'react-bootstrap';

import alphabets from '../alphabets';
import {PureComponent} from '../misc';

const SelectAlphabet = PureComponent(self => {
  const onChange = function () {
    self.props.onChange(self.refs.input.getValue());
  };
  self.render = function () {
    let {value, label} = self.props;
    const options = Object.keys(alphabets).map(function (name) {
      const alphabet = alphabets[name];
      return (<option key={name} value={name}>{alphabet.name}</option>);
    });
    let className = '';
    if (!alphabets.hasOwnProperty(value)) {
      value = '';
      className = 'placeholder';
      options.unshift(<option key='' value='' disabled >{self.props.placeholder}</option>);
    }
    return (<Input ref='input' type="select" className={className} label={label} value={value} onChange={onChange}>{options}</Input>);
  };
});

SelectAlphabet.propTypes = {
  value: React.PropTypes.string,
  label: React.PropTypes.string,
  onChange: React.PropTypes.func.isRequired
};

SelectAlphabet.defaultProps = {
  placeholder: "Select an alphabet"
};

export default SelectAlphabet;
