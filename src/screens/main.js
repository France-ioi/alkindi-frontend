import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';

import Logout from '../ui/logout';
import Tabs from '../ui/tabs';
import CountdownTimer from '../ui/countdown_timer';
import TaskTab from '../tabs/task';
import TeamTab from '../tabs/team';
import PlayFairTab from '../tabs/playfair';
import HistoryTab from '../tabs/history';
import AnswersTab from '../tabs/answers';
import * as actions from '../actions';
import {image_url} from '../assets';

export const MainScreen = PureComponent(self => {

  const setActiveTab = function (tabKey) {
    self.props.dispatch(actions.setActiveTab(tabKey));
  };

   self.render = function () {
    // Interface principale...
    const {activeTabKey, enabledTabs, user_id, countdown, frontendUpdate} = self.props;
    let content = false;
    switch (activeTabKey) {
      case 'team':
        content = <TeamTab/>;
        break;
      case 'task':
        content = <TaskTab round={self.props.round} attempt={self.props.attempt} task={self.props.task} />;
        break;
      case 'cryptanalysis':
        content = <PlayFairTab/>;
        break;
      case 'history':
        content = <HistoryTab attempt={self.props.attempt}/>;
        break;
      case 'answers':
        content = <AnswersTab user_id={user_id} attempt={self.props.attempt}/>;
        break;
    }
    return (
      <div>
        <div id="header">
          <div className="wrapper">
            <img id="header-logo" src={image_url('alkindi-logo.png')} />
            <Tabs activeTabKey={activeTabKey} enabledTabs={enabledTabs} setActiveTab={setActiveTab} />
            <CountdownTimer visible={countdown !== undefined} seconds={Math.round(countdown/1000)}/>
            {frontendUpdate && '*'}
            <Logout user={self.props.user}/>
          </div>
        </div>
        <div className="wrapper">{content}</div>
      </div>);
   };

});

export const mainSelector = function (state) {
  const {activeTabKey, enabledTabs, user, round, attempt, task, countdown, frontendUpdate} = state;
  return {activeTabKey, enabledTabs, user_id: user.id, round, attempt, task, countdown, frontendUpdate};
};

export default connect(mainSelector)(MainScreen);
