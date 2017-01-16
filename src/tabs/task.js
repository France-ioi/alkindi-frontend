import React from 'react';
import {connect} from 'react-redux';
import {Alert, Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {defineAction, defineSelector, defineView, addReducer, addSaga, include, use} from 'epic-linker';
import {call, fork, put, take, select, takeEvery, takeLatest} from 'redux-saga/effects';

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

  //
  // Handle messages coming from the task's iframe.
  //

  yield addSaga(function* () {
    const messageChannel = MessageChannel();
    while (true) {
      const {message, source, origin} = yield take(messageChannel);
      const {user_id, attempt_id, taskWindow} = yield select(getTaskState);
      if (source === taskWindow) {
        console.log('task message', message);
        if (message.task === 'ready') {
          yield fork(pushTaskData, taskWindow);
          continue;
        }
        if ('answer' in message) {
          yield fork(submitAnswer, user_id, attempt_id, message.answer);
          continue;
        }
      }
    }
    function getTaskState(state) {
      const {taskWindow} = state;
      const {user_id, attempt_id} = state.response;
      return {taskWindow, user_id, attempt_id};
    }
  });

  //
  // Whenever there is a taskWindow, every refreshCompleted causes a push
  // of the task data.
  //

  yield use('refreshCompleted');
  yield addSaga(function* () {
    yield takeLatest(deps.taskWindowChanged, function* ({taskWindow}) {
      if (taskWindow) {
        yield takeEvery(deps.refreshCompleted, function* () {
          yield fork(pushTaskData, taskWindow);
        });
      }
    });
  });

  function* pushTaskData (taskWindow) {
    const task = yield select(deps.getTeamData);
    taskWindow.postMessage(JSON.stringify({action: "loadTask", task}), "*");
  }

  function* submitAnswer (user_id, attempt_id, answer) {
    const api = yield select(state => state.api);
    let result;
    try {
      result = yield call(api.submitAnswer, user_id, attempt_id, answer);
    } catch (ex) {
      console.log(ex)
      return;
    }
    console.log(result);
  }

};
