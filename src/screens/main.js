import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';

import Logout from '../ui/logout';
import Tabs from '../ui/tabs';
import CountdownTimer from '../ui/countdown_timer';
import TeamTab from '../tabs/team';
import AttemptsTab from '../tabs/attempts';
import TaskTab from '../tabs/task';
import CryptoTab from '../tabs/crypto';
import HistoryTab from '../tabs/history';
import AnswersTab from '../tabs/answers';
import * as actions from '../actions';
import {asset_url} from '../assets';

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
  const {activeTabKey, enabledTabs, response, countdown, frontendUpdate, crypto} = state;
  const {user, round, attempt, task} = state.response;
  return {activeTabKey, enabledTabs, user_id: user.id, round, attempt, task, countdown, frontendUpdate, crypto};
};

export default connect(selector)(MainScreen);
