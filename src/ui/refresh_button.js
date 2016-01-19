import React from 'react';
import {connect} from 'react-redux';
import {Button} from 'react-bootstrap';

import {PureComponent} from '../misc';
import classnames from 'classnames';

export const RefreshButton = PureComponent(self => {
  const onClick = function () {
    Alkindi.refresh().then(function () {
      onRefresh({success: true});
    }, function () {
      onRefresh({success: false});
    });
  };
  self.render = function () {
    const refreshing = self.props.refreshing;
    const classes = refreshing ? ['fa','fa-spinner','fa-spin'] : ['fa','fa-refresh'];
    return (
      <Button bsStyle='primary' onClick={onClick} disabled={refreshing}>
        <i className={classnames(classes)}/>
      </Button>
    );
  };
});

export const selector = function (state, _props) {
  return {
    request: state.request,
    refreshing: state.refreshing
  };
};

export default connect(selector)(RefreshButton);
