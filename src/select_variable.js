import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Input} from 'react-bootstrap';

import {PureRenderMixin} from './misc';

function getVariables (state, options) {
  const {typeFilter} = options;
  const {toolMap, toolOutputs} = state;
  const variables = [];
  Object.keys(toolMap).forEach(function (id) {
    const {outputs} = toolMap[id];
    const outputValues = toolOutputs[id];
    if (typeof outputValues !== 'undefined') {
      Object.keys(outputValues).forEach(function (name) {
        const variable = outputs[name];
        if (typeof typeFilter !== 'undefined') {
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
  mixins: [PureRenderMixin],
  propTypes: {
    defaultValue: React.PropTypes.string
  },
  getDefaultProps: function () {
    defaultValue: 'select a variable'
  },
  render: function () {
    const {variables} = this.props;
    return (
      <Input ref='input' type='select' label={this.props.label} defaultValue={this.props.defaultValue}>
        {variables.map(name => <option key={name} value={name}>{name}</option>)}
      </Input>);
  },
  getValue: function () {
    return this.refs.input.getValue();
  }
}));
