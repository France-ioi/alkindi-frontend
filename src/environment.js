import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {DropdownButton, MenuItem} from 'react-bootstrap';

export function envLookup (state, name) {
  return state.environment[name];
}

export function envStore (state, name, value) {
  // TODO: check value validity
  return {
    ...state,
    environment: {...state.environment,
      [name]: value
    }
  };
}

// Look up in the environment the variable configured as the tool's input with
// the specified name.
export const lookupInputVar = function (name) {
  return function (state, props) {
    const variable = props.tool.inputs[name];
    return state.environment[variable];
  };
};

function getVariables (state, props) {
  const toolMap = state.toolMap;
  const environment = state.environment;
  const filterType = props.type;
  const variables = [];
  Object.keys(toolMap).forEach(function (id) {
    const {outputs} = toolMap[id];
    Object.keys(outputs).forEach(function (name) {
      const variable = outputs[name];
      if (typeof filterType !== 'undefined') {
        // Filter out variables that have an incompatible type.
        // XXX: we should use the tool's definition for the type of the
        // variable, instead of looking up the last computed value.
        if (variable in environment && filterType !== environment[variable].type)
          return;
      }
      variables.push(variable);
    });
  });
  return variables;
}

const selSelectVariable = createSelector(
  getVariables,
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
