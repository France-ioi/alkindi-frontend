import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';

const TaskTab = PureComponent(self => {
  self.render = function () {
    const {user_id, round, attempt, task} = self.props;
    if (!round || !attempt || !task)
      return false;
    // const taskUrl = 'api/users/'+user_id+'/task.html';
    const taskUrl = 'http://concours-alkindi.fr/docs/tour2_outils/';
    return (
      <div className="wrapper">
        <h1>{round.title}</h1>
        <iframe className='task' src={taskUrl} />
      </div>
    );
  };
});

const selector = function (state, _props) {
  const {user, round, attempt, task} = state;
  return {user_id: user.id, round, attempt, task};
};

export default connect(selector)(TaskTab);
