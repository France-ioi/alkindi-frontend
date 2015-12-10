import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Input} from 'react-bootstrap';

import {PureComponent} from '../misc';

const BareSelectVariable = PureComponent(self => {
  const onChange = function (event) {
    self.props.onChange(self.refs.input.getValue());
  };
  self.render = function () {
    const {value, variables, label} = self.props;
    const options = variables.map(name => <option key={name} value={name}>{name}</option>);
    if (value === undefined)
      options.unshift(<option key='' value={undefined}>select a variable</option>);
    return (<Input ref='input' type='select' label={label} value={value} onChange={onChange} placeholder='select a variable'>{options}</Input>);
  };
});

BareSelectVariable.propTypes = {
  variables: React.PropTypes.array.isRequired,
  onChange: React.PropTypes.func.isRequired,
  label: React.PropTypes.string,
  value: React.PropTypes.string
};

BareSelectVariable.defaultProps = {
  label: 'Select a variable',
  onChange: function (value) {}
};

const WithVariables = connect(createSelector(
  function (state, props) {
    // Extract the list of variables in the environment.
    // Optionally filter using the type property.
    // TODO: require a path property, and only include the environment in
    // the scope corresponding to that path?
    const {scope, typeFilter} = props;
    const variables = [];
    for (var variable in scope) {
      if (typeof typeFilter !== 'undefined') {
        // Filter out variables that have an incompatible type.
        const value = scope[variable];
        if (typeFilter !== value.type)
          continue;
      }
      variables.push(variable);
    };
    return variables;
  },
  function (variables) {
    return {variables};
  })
);

const SelectVariable = WithVariables(BareSelectVariable);

export default SelectVariable;
