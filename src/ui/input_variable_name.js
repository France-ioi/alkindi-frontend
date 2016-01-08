import React from 'react';
import {Input} from 'react-bootstrap';

import {PureComponent} from '../misc';

const InputVariableName = PureComponent(self => {
  const onChange = function () {
    const name = self.refs.input.getValue();
    // TODO: validate characters used in name
    self.props.onChange(name);
  };
  self.render = function () {
    const {label, value, placeholder} = self.props;
    return (<Input type='text' ref='input' label={label} value={value} onChange={onChange} placeholder={placeholder}/>);
  };
});

InputVariableName.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  label: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  value: React.PropTypes.string
};

InputVariableName.defaultProps = {
  label: "Variable name",
  placeholder: "Enter variable name",
  value: '',
  onChange: function (_value) {}
};

export default InputVariableName;
