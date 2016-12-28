import React from 'react';
import {Alert} from 'react-bootstrap';
import EpicComponent from 'epic-component';

const twoDigits = function (number) {
  return ("0" + number).slice(-2);
};

export const RefreshButton = EpicComponent(self => {
  self.render = function () {
    let {visible, seconds} = self.props;
    if (!visible)
      return false;
    const style =
      seconds <= (5 * 60) ? 'danger' :
      seconds <= (15 * 60) ? 'warning' :
      'success';
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    seconds = Math.round(seconds);
    return (
      <Alert bsStyle={style}>
        <p className="text-center">
          <i className="fa fa-clock-o"/>
          {' '}
          {hours > 0 && (twoDigits(hours) + ':')}
          {twoDigits(minutes)}{':'}
          {twoDigits(seconds)}
        </p>
      </Alert>
    );
  };
});

export default RefreshButton;
