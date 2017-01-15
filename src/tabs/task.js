import React from 'react';
import {connect} from 'react-redux';
import {Alert, Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {defineAction, defineSelector, defineView, addReducer, addSaga, include, use} from 'epic-linker';
import {call, put, take, select, takeEvery} from 'redux-saga/effects';

import {default as ManagedProcess, getManagedProcessState} from '../managed_process';
import getMessage from '../messages';
import MessageChannel from '../message_channel';

export default function* (deps) {

  yield defineSelector('TaskTabSelector', function (state, _props) {
    const {attempt, round_task, team_data} = state.response;
    const isTeamLocked = false; // XXX
    const startAttempt = getManagedProcessState(state, 'startAttempt');
    return {attempt, round_task, team_data, isTeamLocked, startAttempt};
  });

  yield defineSelector('getTeamData', function (state) {
    return state.response.team_data;
  });

  yield defineView('TaskTab', 'TaskTabSelector', EpicComponent(self => {

    function refTask (element) {
      const taskWindow = element && element.contentWindow;
      self.props.dispatch({type: deps.taskWindowChanged, taskWindow});
    }

    function onStartAttempt () {
      const attempt_id = self.props.attempt.id;
      self.props.dispatch({type: deps.startAttempt, attempt_id});
    }

    function renderStartAttempt () {
      const {pending, error} = self.props.startAttempt;
      return (
        <div>
          <p className="text-center">
            <Button bsStyle="primary" bsSize="large" onClick={onStartAttempt} disabled={pending}>
              {'accéder au sujet '}
              {pending
                ? <i className="fa fa-spinner fa-spin"/>
                : <i className="fa fa-arrow-right"/>}
            </Button>
          </p>
          {error && <Alert bsStyle='danger'>{getMessage(error)}</Alert>}
        </div>
      );
    }

    self.render = function () {
      const {attempt, round_task, team_data, isTeamLocked} = self.props;
      if (!team_data) {
        return (
          <div className="tab-content">
            {renderStartAttempt()}
          </div>
        );
      }
      return (
        <div className="tab-content">
          <iframe className="task" src={round_task.frontend_url} ref={refTask}/>
          <p>{JSON.stringify(round_task)}</p>
          <p>{JSON.stringify(team_data)}</p>
        </div>
      );
    };

  }));

  yield use('startAttempt', 'buildRequest', 'managedRefresh');
  yield include(ManagedProcess('startAttempt', 'Attempt.Start', p => function* (action) {
    const {attempt_id} = action;
    const api = yield select(state => state.api);
    let result;
    try {
      result = yield call(api.startAttempt, attempt_id);
    } catch (ex) {
      yield p.failure('server error');
      return;
    }
    if (result.success) {
      const request = yield select(deps.buildRequest);
      yield call(deps.managedRefresh, request);
      yield p.success();
    } else {
      yield p.failure(result.error);
    }
  }));

  yield defineAction('taskWindowChanged', 'Task.Window.Changed');
  yield addReducer('taskWindowChanged', function (state, action) {
    const {taskWindow} = action;
    return {...state, taskWindow};
  });

  yield addSaga(function* () {
    yield takeEvery(deps.taskWindowChanged, manageTaskWindow);
  });

  const messageChannel = MessageChannel();

  function* manageTaskWindow (action) {
    const {taskWindow} = action;
    while (true) {
      const {message, source, origin} = yield take(messageChannel);
      if (source === taskWindow) {
        console.log('task message', message);
        if (message.task === 'ready') {
          const task = yield select(deps.getTeamData);
          taskWindow.postMessage(JSON.stringify({action: "loadTask", task}), "*");
        }
        // TODO: fork & pass task to iframe on refresh
      }
    }
  }

};
