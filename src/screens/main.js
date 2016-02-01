import React from 'react';
import EpicComponent from 'epic-component';
import {connect} from 'react-redux';

import Logout from '../ui/logout';
import Tabs from '../ui/tabs';
import CountdownTimer from '../ui/countdown_timer';
import TeamTab from '../tabs/team';
import AttemptsTab from '../tabs/attempts';
import TaskTab from '../tabs/task';
import CryptoTab from '../tabs/crypto';
import HistoryTab from '../tabs/history';
import AnswersTab from '../tabs/answers';
import ResultsTab from '../tabs/results';
import * as actions from '../actions';
import {asset_url} from '../assets';

export const MainScreen = EpicComponent(self => {

   const setActiveTab = function (tabKey) {
     self.props.dispatch(actions.setActiveTab(tabKey));
   };

   self.render = function () {
    // Interface principale...
    const {activeTabKey, enabledTabs, user, countdown, frontendUpdate} = self.props;
    const user_id = user.id;
    let content = false;
    switch (activeTabKey) {
      case 'team':
        content = <TeamTab/>;
        break;
      case 'attempts':
        content = <AttemptsTab/>;
        break;
      case 'task':
        content = <TaskTab round={self.props.round} attempt={self.props.attempt} task={self.props.task} />;
        break;
      case 'cryptanalysis':
        content = <CryptoTab api={Alkindi.api} manager={Alkindi.manager} user_id={user_id} task={self.props.task}/>;
        break;
      case 'history':
        content = <HistoryTab api={Alkindi.api} attempt={self.props.attempt}/>;
        break;
      case 'answers':
        content = <AnswersTab api={Alkindi.api} user_id={user_id} attempt={self.props.attempt}/>;
        break;
      case 'results':
        content = <ResultsTab/>;
        break;
    }
    return (
      <div>
        <div id="header">
          <div className="wrapper">
            <img id="header-logo" src={asset_url('images/alkindi-logo.png')} />
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

export const selector = function (state) {
  const {activeTabKey, enabledTabs, response, countdown, frontendUpdate} = state;
  const {attempt, task} = state.response;
  return {activeTabKey, enabledTabs, attempt, task, countdown, frontendUpdate};
};

export default connect(selector)(MainScreen);
