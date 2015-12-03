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

export const SelectVariable = connect(selSelectVariable)(React.createClass({
  getDefaultProps: function () {
    return {
      value: undefined,
      eventKey: '',
      onSelect: x => x,
      prefix: 'single'
    };
  },
  propTypes: {
    value: React.PropTypes.string,
    eventKey: React.PropTypes.string,
    onSelect: React.PropTypes.func,
    prefix: React.PropTypes.string
  },
  render: function () {
    // TODO: set a unique id
    const id = this.props.prefix + '-select-variable';
    const {value,variables} = this.props;
    const title = (typeof value === 'string' && value.length > 0) ? value : 'select a variable';
    return (
      <DropdownButton title={title} onSelect={this.onSelect} id={id}>
        {variables.map(name => <MenuItem key={name} eventKey={name}>{name}</MenuItem>)}
      </DropdownButton>);
  },
  onSelect: function (event, key) {
    this.props.onSelect(event, this.props.eventKey, key);
  }
}));
