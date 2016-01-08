import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';

const TaskTab = PureComponent(self => {
  self.render = function () {
    const {user_id, round, attempt, task} = self.props;
    if (!round || !attempt || !task)
      return false;
    return (
      <div className="wrapper">
        <h1>{round.title}</h1>
        <iframe className='task' src={'api/users/'+user_id+'/task.html'}/>
      </div>
    );
  };
});

const selector = function (state, _props) {
  const {user, round, attempt, task} = state;
  return {user_id: user.id, round, attempt, task};
};

export default connect(selector)(TaskTab);
