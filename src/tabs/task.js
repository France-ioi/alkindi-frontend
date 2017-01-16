import React from 'react';
import {connect} from 'react-redux';
import {Alert, Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {defineAction, defineSelector, defineView, addReducer, addSaga, include, use} from 'epic-linker';
import {call, fork, put, take, select, takeEvery, takeLatest} from 'redux-saga/effects';

import {default as ManagedProcess, getManagedProcessState} from '../managed_process';
import getMessage from '../messages';
import MessageChannel from '../message_channel';

const isDev = process.env.NODE_ENV !== 'production';

export default function* (deps) {

  yield defineSelector('TaskTabSelector', function (state, _props) {
    const {attempt, round_task, team_data} = state.response;
    const isTeamLocked = false; // XXX
    const startAttempt = getManagedProcessState(state, 'startAttempt');
    return {attempt, round_task, team_data, isTeamLocked, startAttempt};
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
          <iframe className="task" src={round_task.frontend_url} ref={refTask}
            style={{height: '1000px'}}/>
          {false && <textarea value={JSON.stringify(round_task, null, 2)}></textarea>}
          {false && <textarea value={JSON.stringify(team_data, null, 2)}></textarea>}
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
        if (isDev) {
          console.log('task message', message);
        }
        if (message.task === 'ready') {
          yield fork(pushTaskWindowData, taskWindow);
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
          yield fork(pushTaskWindowData, taskWindow);
        });
      }
    });
  });

  function* pushTaskWindowData (taskWindow) {
    const data = yield select(getTaskWindowData);
    taskWindow.postMessage(JSON.stringify({action: "loadTask", ...data}), "*");
  }

  function getTaskWindowData (state) {
    const {team_data} = state.response;
    const {score} = state.response.attempt;
    return {task: team_data, score};
  }

  function* submitAnswer (user_id, attempt_id, answer) {
    const api = yield select(state => state.api);
    let response;
    try {
      response = yield call(api.submitAnswer, user_id, attempt_id, answer);
    } catch (ex) {
      console.log(ex)
      return;
    }
    const {result, score, feedback} = response;
    const taskWindow = yield select(state => state.taskWindow);
    taskWindow.postMessage(JSON.stringify({action: "feedback", result, score, feedback}), "*");
  }

};
