import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {PureComponent} from '../misc';
import {Answer} from '../playfair';
import Api from '../api';
import Notifier from '../ui/notifier';

const AnswersTab = PureComponent(self => {

  const api = Api();
  const notifier = <Notifier api={api}/>;

  const submitAnswer = function (data) {
    const {attempt} = self.props;
    api.submitAnswer(attempt.id, data);
  };

  self.render = function () {
    return (
      <div className="wrapper">
        {notifier}
        <Answer submit={submitAnswer}/>
      </div>
    );
  };
});

export default AnswersTab;
