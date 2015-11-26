// Tool user interface.

import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Button, ButtonGroup, Panel} from 'react-bootstrap';

import registry from './tool-registry';


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
    const {title,type,canRemove,canConfigure,state} = this.props;
    const {collapsed} = state;
    const rightButtons = [];
    if (canConfigure)
      rightButtons.push(<Button key="cfg" onClick={this.configureClicked}><i className="fa fa-wrench"></i></Button>);
    if (canRemove)
      rightButtons.push(<Button key="close" onClick={this.removeClicked}><i className="fa fa-times"></i></Button>);
    let inner = false;
    if (!collapsed && type in registry) {
      let tool = registry[this.props.type];
      let Component = this.props.state.configuring ? tool.configure : tool.normal;
      inner = (<Component {...this.props}/>);
    }
    let header = [
      (<Button key="min" onClick={this.minClicked}><i className="fa fa-minus"></i></Button>), ' ',
      <span key="title">{title}</span>,
      <ButtonGroup key="right" className="pull-right">{rightButtons}</ButtonGroup>
    ];
    return (
      <Panel header={header}>{inner}</Panel>
    );
  },
  minClicked: function () {
    this.props.dispatch({
      type: 'UPDATE_TOOL',
      id: this.props.id,
      data: {
        state: {
          collapsed: !this.props.state.collapsed
        }
      }
    });
  },
  configureClicked: function () {
    this.props.dispatch({
      type: 'UPDATE_TOOL',
      id: this.props.id,
      data: {
        state: {
          configuring: !this.props.state.configuring
        }
      }
    });
  },
  removeClicked: function () {
    this.props.dispatch({type: 'REMOVE_TOOL', id: this.props.id});
  }
}));
