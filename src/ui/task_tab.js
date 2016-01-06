import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';
import TextDisplay from '../ui/text_display';

const TaskTab = PureComponent(self => {
  self.render = function () {
    const {round, attempt, task} = self.props;
    if (!round || !attempt || !task)
      return false;
    return (
      <div className="wrapper">
        <h1>{round.title}</h1>
        <div dangerouslySetInnerHTML={{__html: task.pre_html}}/>
        <div className="grillesSection">
          <div className="y-scrollBloc task-cipher-text">{task.cipher_text}</div>
        </div>
        <div dangerouslySetInnerHTML={{__html: task.post_html}}/>
      </div>
    );
  };
});

const selector = function (state, props) {
  const {round, attempt, task} = state;
  return {round, attempt, task};
};

export default connect(selector)(TaskTab);