import React from 'react';
import EpicComponent from 'epic-component';
import {include, use, defineAction, defineSelector, defineView, addReducer} from 'epic-linker';

import alkindiLogo from '../../assets/alkindi-logo.png';
import TeamTab from '../tabs/team';
import AttemptsTab from '../tabs/attempts';
import TaskTab from '../tabs/task';
import HistoryTab from '../tabs/history';
//import ResultsTab from '../tabs/results';
import Tabs from '../ui/tabs';
import CountdownTimer from '../ui/countdown_timer';

export default function (bundle, deps) {

  bundle.include(TeamTab);
  bundle.include(AttemptsTab);
  bundle.include(TaskTab);
  bundle.include(HistoryTab);

  bundle.use('LogoutButton', 'TeamTab', 'AttemptsTab', 'TaskTab');

  bundle.defineAction('setActiveTab', 'Tabs.SetActive');

  bundle.defineView('MainScreen', 'MainScreenSelector', EpicComponent(self => {

    const setActiveTab = function (tabKey) {
      self.props.dispatch({type: deps.setActiveTab, tabKey});
    };

    self.render = function () {
      // Interface principale...
      const {activeTabKey, enabledTabs, countdown, frontendUpdate} = self.props;
      let content = false;
      switch (activeTabKey) {
        case 'team':
          content = <deps.TeamTab/>;
          break;
        case 'attempts':
          content = <deps.AttemptsTab/>;
          break;
        case 'task':
          content = <deps.TaskTab/>;
          break;
        case 'results':
          content = <deps.ResultsTab/>;
          break;
      }
      return (
        <div>
          <div id="header">
            <div className="wrapper">
              <img id="header-logo" src={alkindiLogo} />
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

  bundle.defineSelector('MainScreenSelector', function (state) {
    const {activeTabKey, enabledTabs, response, countdown, frontendUpdate} = state;
    const {user, round, team, attempt, task} = state.response;
    return {activeTabKey, enabledTabs, user, round, team, attempt, task, countdown, frontendUpdate};
  });

  bundle.addReducer('setActiveTab', function (state, action) {
    const {tabKey} = action;
    const {enabledTabs, pendingAction, lastAction, lastError} = state;
    if (!enabledTabs[tabKey] || pendingAction) {
      return state;
    }
    return {...state, activeTabKey: tabKey, lastAction: undefined, lastError: false};
  });

  /* Tabs are updated after a successful refresh. */
  bundle.addReducer('refreshCompleted', function (state, action) {
    if (!action.success) {
      return state;
    }
    return selectTab(state, state.activeTabKey);
  });

  function selectTab (state, tabKey) {
    const {response} = state;
    const {round, team, attempt} = response;
    const haveRound = !!round;
    const haveTeam = !!team;
    const haveAttempt = !!attempt;
    const isTeamValid = haveTeam && !team.is_invalid;
    const enabledTabs = {
      team: true,
      attempts: isTeamValid && haveRound,
      task: haveAttempt,
      results: false
    };
    // If the active tab has become disabled, select the team tab, which is
    // always available.
    if (tabKey === undefined || !enabledTabs[tabKey]) {
      tabKey = 'team';
    }
    return {...state, activeTabKey: tabKey, enabledTabs};
  };

};
