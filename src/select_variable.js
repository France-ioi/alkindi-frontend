import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {DropdownButton, MenuItem} from 'react-bootstrap';

function getVariables (state, options) {
  const {filterType} = options;
  const {toolMap, toolOutputs} = state;
  const variables = [];
  Object.keys(toolMap).forEach(function (id) {
    const {outputs} = toolMap[id];
    const outputValues = toolOutputs[id];
    if (typeof outputValues !== 'undefined') {
      Object.keys(outputValues).forEach(function (name) {
        const variable = outputs[name];
        if (typeof filterType !== 'undefined') {
          // Filter out variables that have an incompatible type.
          const value = outputValues[name];
          if (typeFilter !== value.type)
            return;
        }
        variables.push(variable);
      });
    }
  });
  return variables;
}

const selSelectVariable = createSelector(
  function (state, props) {
    return getVariables(state, {typeFilter: props.type});
  },
  function (variables) {
    return {variables};
  });

export const SelectVariable = connect(selSelectVariable, false, false, {withRef: true})(React.createClass({
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
    const id = this.props.prefix + '-select-variable';
    const {variables} = this.props;
    const {value} = this.state;
    const title = (typeof value === 'string' && value.length > 0) ? value : 'select a variable';
    return (
      <DropdownButton title={title} onSelect={this.onSelect} id={id}>
        {variables.map(name => <MenuItem key={name} eventKey={name}>{name}</MenuItem>)}
      </DropdownButton>);
  },
  onSelect: function (event, key) {
    this.setState({value: key});
  },
  getValue: function () {
    return this.state.value;
  }
}));
