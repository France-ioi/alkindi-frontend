// Tool user interface.

import React from 'react';
import {Button, Panel} from 'react-bootstrap';

import registry from './tool-registry';

export const Tool = React.createClass({
  getInitialState: function () {
    return {
      collapsed: false
    };
  },
  getDefaultProps: function () {
    return {
      title: 'untitled',
      canClose: false
    };
  },
  propTypes: function () {
    return {
      title: React.PropTypes.string,
      type: React.PropTypes.string,
      canClose: React.PropTypes.boolean
    };
  },
  render: function () {
    const {title,type,canClose} = this.props;
    const {collapsed} = this.state; // TODO: move to global state
    const header = [
      (<Button key="min" onClick={this.minClicked}><i className="fa fa-minus"></i></Button>), ' ',
      <span key="title">{title}</span>
    ];
    if (canClose)
      header.push(<Button key="close" className="pull-right"><i className="fa fa-times"></i></Button>);
    let inner = false;
    if (!collapsed && type in registry) {
      const {Component,propTypes} = registry[type];
      const props = this.props;
      let typeErrors = [];
      Object.keys(propTypes).forEach(function (name) {
        if (!checkType(props[name], propTypes[name])) {
          typeErrors.push(
            <p>Variable {op.varName} of type {value.type} was used at type {op.valueType}</p>
          );
        }
      });
      if (typeErrors.length > 0)
        inner = (<div><p>type errors</p><pre>{typeErrors}</pre></div>);
      else
        inner = (<Component {...this.props}/>);
    }
    return (
      <Panel header={header}>{inner}</Panel>
    );
  },
  minClicked: function () {
    // TODO: dispatch an action that modifies the global state
    let {collapsed} = this.state;
    this.setState({collapsed: !this.state.collapsed});
  }
});

function checkType (value, expectedType) {
  if (value.type === expectedType)
    return true;
  // TODO: check for more complex types?
  return false;
}

export function renderTool (options) {
  let props = {...options.props};
  if ('lookup' in options) {
    // Perform environment lookups.
    let env = options.state.environment;
    Object.keys(options.lookup).forEach(function (key) {
      props[key] = env[options.lookup[key]];
    });
  }
  return (<Tool {...props} />);
}

export default Tool;
