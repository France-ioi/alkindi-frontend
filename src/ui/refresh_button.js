import React from 'react';
import {connect} from 'react-redux';
import {Button} from 'react-bootstrap';

import {PureComponent} from '../misc';
import classnames from 'classnames';

export const selector = function (state, props) {
  return {
    refreshing: props.refreshing || state.refreshing,
    refresh: props.refresh
  };
};

export const RefreshButton = PureComponent(self => {
  const onClick = function () {
    let {refresh} = self.props;
    if (refresh) {
      // Local refresh.
      handleOutcome(refresh())
    } else {
      // Global refresh.
      handleOutcome(Alkindi.refresh())
    }
  };
  const handleOutcome = function (promise) {
    const {onRefresh} = self.props;
    if (onRefresh) {
      promise.then(function () {
        onRefresh({success: true});
      }, function () {
        onRefresh({success: false});
      });
    }
    return promise;
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

export default connect(selector)(RefreshButton);
