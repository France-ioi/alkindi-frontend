// Tool user interface.

import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button, Panel} from 'react-bootstrap';

import registry from './tool-registry';


const toolSelectorFun = function (state, props) {
  return state.toolMap[props.id];
};
const toolSelector = createSelector(toolSelectorFun, function (x) { return x; });

export default connect(toolSelector)(React.createClass({
  getInitialState: function () {
    return {
      collapsed: false,
      configuring: false
    };
  },
  propTypes: function () {
    return {
      id: React.PropTypes.string
    };
  },
  render: function () {
    console.log(this.props);
    const {title,type,canRemove} = this.props;
    const {collapsed} = this.state; // TODO: move to global state
    const header = [
      (<Button key="min" onClick={this.minClicked}><i className="fa fa-minus"></i></Button>), ' ',
      (<Button key="cfg" onClick={this.configureClicked}><i className="fa fa-wrench"></i></Button>), ' ',
      <span key="title">{title}</span>
    ];
    if (canRemove)
      header.push(<Button key="close" onClick={this.removeClicked} className="pull-right"><i className="fa fa-times"></i></Button>);
    let inner = false;
    if (!collapsed && type in registry) {
      let tool = registry[this.props.type];
      let Component = this.state.configuring ? tool.configure : tool.normal;
      inner = (<Component {...this.props}/>);
    }
    return (
      <Panel header={header}>{inner}</Panel>
    );
  },
  minClicked: function () {
    // TODO: dispatch an action that modifies the global state
    let {collapsed} = this.state;
    this.setState({collapsed: !collapsed});
  },
  configureClicked: function () {
    let {configuring} = this.state;
    this.setState({configuring: !configuring});
  },
  removeClicked: function () {
    this.props.dispatch({type: 'REMOVE_TOOL', id: this.props.id});
  }
}));
