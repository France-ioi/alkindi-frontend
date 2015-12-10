import React from 'react';
import {Button, ButtonGroup, Label} from 'react-bootstrap';
import classnames from 'classnames';

import {PureComponent} from '../misc';
import {removeTool, updateTool} from '../actions';

const ToolHeader = PureComponent(self => {
  const collapseClicked = function () {
    const {update, tool} = self.props;
    update({collapsed: !tool.state.collapsed});
  };
  const configureClicked = function () {
    const {update, tool} = self.props;
    update({configuring: !tool.state.configuring});
  };
  const removeClicked = function () {
    const {dispatch, id} = self.props;
    dispatch(removeTool(id));
  };
  self.render = function () {
    const {tool, title, needRefresh} = self.props;
    const {canRemove, canConfigure, configuring, collapsed} = tool.state;
    const rightButtons = [];
    if (canConfigure)
      rightButtons.push(<Button key="configure" onClick={configureClicked} active={configuring}><i className="fa fa-wrench"/></Button>);
    if (canRemove)
      rightButtons.push(<Button key="remove" onClick={removeClicked}><i className="fa fa-times"/></Button>);
    const collapseClasses = classnames(['fa', collapsed ? 'fa-plus' : 'fa-minus']);
    const header = [
      <Button key="collapse" onClick={collapseClicked} active={collapsed}><i className={collapseClasses}></i></Button>,
      ' ',
      <span key="title">{title}</span>
    ];
    if (needRefresh)
      header.push(<Label key="invalidated" bsStyle="warning">refresh</Label>);
    header.push(<ButtonGroup key="rightButtons" className="pull-right">{rightButtons}</ButtonGroup>);
    return (<div className="tool-header">{header}</div>);
  };
});

export default ToolHeader;
