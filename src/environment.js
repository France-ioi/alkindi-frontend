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

export function lookupByPropName (name) {
  return function (state, props) {
    return state.environment[props[name]];
  };
}

function getVariables (state, props) {
  const environment = state.environment;
  const variables = [];
  Object.keys(environment).forEach(function (name) {
    if (typeof props.type !== 'undefined') {
      // Filter out variables that have an incompatible type.
      if (props.type !== environment[name].type)
        return;
    }
    variables.push(name);
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
    const title = value.length === 0 ? 'select a variable' : value;
    return (
      <DropdownButton title={title} onSelect={this.onSelect} id={id}>
        {variables.map(name => <MenuItem key={name} eventKey={name}>{name}</MenuItem>)}
      </DropdownButton>);
  },
  onSelect: function (event, key) {
    this.props.onSelect(event, this.props.eventKey, key);
  }
}));
