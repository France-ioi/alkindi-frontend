
import React from 'react';
import {Button, Panel} from 'react-bootstrap';

import registry from './tool-registry';

module.exports = React.createClass({
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
    var header = [
      (<Button key="min" onClick={this.minClicked}><i className="fa fa-minus"></i></Button>), ' ',
      <span key="title">{this.props.title}</span>,
    ];
    if (this.props.canClose)
      header.push(<Button key="close" className="pull-right"><i className="fa fa-times"></i></Button>);
    var inner = false;
    if (!this.state.collapsed && this.props.type in registry) {
      var Component = registry[this.props.type];
      inner = (<Component {...this.props}/>);
    }
    return (
      <Panel header={header}>{inner}</Panel>
    );
  },
  minClicked: function () {
    this.setState({collapsed: !this.state.collapsed});
  }
});
