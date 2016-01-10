import React from 'react';
import {connect} from 'react-redux';
import {Button} from 'react-bootstrap';

import {PureComponent} from '../misc';
import classnames from 'classnames';

export const selector = function (state, props) {
  const isPageRefresh = !('refresh' in props);
  return {
    refreshing: props.refreshing || state.refreshing,
    refresh: props.refresh || state.refresh,
    user: isPageRefresh && state.user,
    isPageRefresh
  };
};

export const RefreshButton = PureComponent(self => {
  const onClick = function () {
    const {isPageRefresh, refresh, user} = self.props;
    if (isPageRefresh) {
      if (user === undefined)
        return;
      refresh(user.id);
    } else {
      refresh();
    }
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
