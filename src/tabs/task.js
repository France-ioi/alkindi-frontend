import React from 'react';
import {connect} from 'react-redux';

import EpicComponent from 'epic-component';
import Tasks from '../tasks';

const TaskTab = EpicComponent(self => {
  self.render = function () {
    const {user_id, round, attempt, task} = self.props;
    if (!round || !attempt || !task)
      return false;
    const Task = Tasks[task.front].Task;
    return (
      <div className="wrapper">
        <h1>{round.title}</h1>
        <Task task={task}/>
      </div>
    );
  };
});

const selector = function (state, _props) {
  const {user, round, task} = state.response;
  const {attempt} = state;
  return {user_id: user.id, round, attempt, task};
};

export default connect(selector)(TaskTab);
