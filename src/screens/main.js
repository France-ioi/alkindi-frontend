import React from 'react';
import EpicComponent from 'epic-component';
import {include, use, defineAction, defineSelector, defineView, addReducer} from 'epic-linker';

import TeamTab from '../tabs/team';
import AttemptsTab from '../tabs/attempts';

import Tabs from '../ui/tabs';
import CountdownTimer from '../ui/countdown_timer';
//import TaskTab from '../tabs/task';
//import CryptoTab from '../tabs/crypto';
//import HistoryTab from '../tabs/history';
//import AnswersTab from '../tabs/answers';
//import ResultsTab from '../tabs/results';
import {asset_url} from '../assets';

export default function* (deps) {

  yield include(TeamTab);
  yield include(AttemptsTab);

  yield use('LogoutButton', 'TeamTab', 'AttemptsTab');

  yield defineAction('setActiveTab', 'Tabs.SetActive');

  yield defineView('MainScreen', 'MainScreenSelector', EpicComponent(self => {

    const setActiveTab = function (tabKey) {
      self.props.dispatch({type: deps.setActiveTab, tabKey});
    };

    self.render = function () {
      // Interface principale...
      const {activeTabKey, enabledTabs, user, countdown, frontendUpdate} = self.props;
      const user_id = user.id;
      let content = false;
      switch (activeTabKey) {
        case 'team':
          content = <deps.TeamTab/>;  // XXX team={team}
          break;
        case 'attempts':
          content = <deps.AttemptsTab/>;
          break;
        /*
        case 'task':
          content = <TaskTab round={self.props.round} attempt={self.props.attempt} task={self.props.task} />;
          break;
        case 'cryptanalysis':
          content = <CryptoTab user_id={user_id} task={self.props.task}/>;
          break;
        case 'history':
          content = <HistoryTab attempt={self.props.attempt}/>;
          break;
        case 'answers':
          content = <AnswersTab user_id={user_id} attempt={self.props.attempt}/>;
          break;
        case 'results':
          content = <ResultsTab/>;
          break;
        */
      }
      return (
        <div>
          <div id="header">
            <div className="wrapper">
              <img id="header-logo" src={asset_url('alkindi-logo.png')} />
              <Tabs activeTabKey={activeTabKey} enabledTabs={enabledTabs} setActiveTab={setActiveTab} />
              <CountdownTimer visible={countdown !== undefined} seconds={Math.round(countdown/1000)}/>
              {frontendUpdate && '*'}
              <deps.LogoutButton/>
            </div>
          </div>
          <div className="wrapper">{content}</div>
        </div>);
    };

  }));

  yield defineSelector('MainScreenSelector', function (state) {
    const {activeTabKey, enabledTabs, response, countdown, frontendUpdate} = state;
    const {user, round, team, attempt, task} = state.response;
    return {activeTabKey, enabledTabs, user, round, team, attempt, task, countdown, frontendUpdate};
  });

  yield addReducer('setActiveTab', function (state, action) {
    const {tabKey} = action;
    const {enabledTabs} = state;
    return enabledTabs[tabKey] ? {...state, activeTabKey: tabKey} : state;
  });

  /* Tabs are updated after a refresh. */
  yield addReducer('refreshSucceeded', function (state, action) {
    return selectTab(state, state.activeTabKey);
  });

  function selectTab (state, tabKey) {
    const haveTask = !!state.response.task;
    const haveAttempts = !!state.response.attempts;
    const enabledTabs = {
      team: true,
      attempts: haveAttempts,
      task: haveTask,
      cryptanalysis: haveTask,
      history: haveTask,
      answers: haveTask,
      results: true
    };
    // If the active tab has become disabled, select the team tab, which is
    // always available.
    if (tabKey === undefined || !enabledTabs[tabKey]) {
      tabKey = 'team';
    }
    return {...state, activeTabKey: tabKey, enabledTabs};
  };

};
