import React from 'react';
import {connect} from 'react-redux';
import {Button} from 'react-bootstrap';

import {PureComponent} from '../misc';
import classnames from 'classnames';

export const selector = function (state) {
  const {refreshing, refresh, user} = state;
  return {refreshing, refresh, user};
};

export const RefreshButton = PureComponent(self => {
  const onClick = function () {
    const {refresh, user} = self.props;
    if (user === undefined)
      return;
    refresh(user.id);
  };
  self.render = function () {
    const {refresh, refreshing} = self.props;
    const classes = refreshing ? ['fa','fa-spinner','fa-spin'] : ['fa','fa-refresh'];
    return (
      <Button bsStyle='primary' onClick={onClick} disabled={refreshing}>
        <i className={classnames(classes)}/>
      </Button>
    );
  };
});

export default connect(selector)(RefreshButton);
