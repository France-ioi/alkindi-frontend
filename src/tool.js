// Tool user interface.

import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button, ButtonGroup, Panel} from 'react-bootstrap';

import registry from './tool-registry';
import {removeTool, updateToolState} from './actions';

const toolSelectorFun = function (state, props) {
  return state.toolMap[props.id];
};
const toolSelector = createSelector(toolSelectorFun, function (x) { return x; });

export default connect(toolSelector)(React.createClass({
  propTypes: function () {
    return {
      id: React.PropTypes.string
    };
  },
  render: function () {
    const {type,canRemove,canConfigure,state} = this.props;
    const {collapsed,configuring} = state;
    let mode = collapsed ? 'collapsed' : 'normal';
    if (canConfigure && configuring)
      mode = 'configure';
    const rightButtons = [];
    if (canConfigure)
      rightButtons.push(<Button key="cfg" onClick={this.configureClicked} active={configuring}><i className="fa fa-wrench"/></Button>);
    if (canRemove)
      rightButtons.push(<Button key="close" onClick={this.removeClicked}><i className="fa fa-times"/></Button>);
    let inner = false, title;
    if (type in registry) {
      const tool = registry[this.props.type];
      const Component = tool[mode];  // JSX requires uppercase first letter
      inner = (<Component {...this.props}/>);
      title = tool.buildTitle(this.props);
    } else {
      title = "unknown tool type " + type;
    }
    let header = [
      (<Button key="min" onClick={this.minClicked} active={collapsed}><i className="fa fa-minus"></i></Button>), ' ',
      <span key="title">{title}</span>,
      <ButtonGroup key="right" className="pull-right">{rightButtons}</ButtonGroup>
    ];
    return (
      <Panel header={header}>{inner}</Panel>
    );
  },
  minClicked: function () {
    this.props.dispatch(
      updateToolState(this.props.id, {collapsed: !this.props.state.collapsed}));
  },
  configureClicked: function () {
    this.props.dispatch(
      updateToolState(this.props.id, {configuring: !this.props.state.configuring}));
  },
  removeClicked: function () {
    this.props.dispatch(removeTool(this.props.id));
  }
}));
