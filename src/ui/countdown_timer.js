import React from 'react';

import {PureComponent} from '../misc';
import {Alert} from 'react-bootstrap';

const twoDigits = function (number) {
  return ("0" + number).slice(-2);
};

export const RefreshButton = PureComponent(self => {
  self.render = function () {
    let seconds = self.props.seconds;
    const style =
      seconds <= (5 * 60) ? 'danger' :
      seconds <= (15 * 60) ? 'warning' :
      'success';
    console.log('seconds = ', seconds);
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    console.log('seconds = ', seconds, '  hours = ', hours);
    const minutes = Math.floor(seconds / 60);
    console.log('seconds = ', seconds, '  minutes = ', minutes);
    seconds -= minutes * 60;
    seconds = Math.round(seconds);
    console.log('seconds = ', seconds);
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
