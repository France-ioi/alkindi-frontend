import React from 'react';
import {connect} from 'react-redux';
import {Alert, Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {defineAction, defineSelector, defineView, addReducer, addSaga, include, use} from 'epic-linker';
import {call, fork, put, take, select, takeEvery, takeLatest} from 'redux-saga/effects';

import {default as ManagedProcess, getManagedProcessState} from '../managed_process';
import getMessage from '../messages';
import Peer from '../peer';

const isDev = process.env.NODE_ENV !== 'production';

export default function* (deps) {

  yield use('refresh');

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
  // Handle communication with the task's iframe.
  //

  const peer = Peer();
  yield addSaga(peer.handleIncomingActions);

  peer.on('initTask', function* initTask () {
    return yield select(getTaskWindowData);
  });

  /* Pass answer submissions from the task to the backend. */
  peer.on('submitAnswer', function* submitAnswer (answer) {
    const {api, user_id, attempt_id} = yield select(getApiUserAttemptIds);
    let result;
    try {
      result = yield call(api.submitAnswer, user_id, attempt_id, answer);
    } catch (ex) {
      return {success: false, error: 'server error'};
    }
    /* Trigger a refresh to update the best score and attempt status. */
    yield put({type: deps.refresh});
    return result;
  });

  /* Pass hint requests from the task to the backend. */
  peer.on('requestHint', function* requestHint (request) {
    const {api, attempt_id} = yield select(getApiUserAttemptIds);
    let result;
    try {
      result = yield call(api.getHint, attempt_id, request);
    } catch (ex) {
      return {success: false, error: 'server error'};
    }
    /* Trigger a refresh to update the task and push to the iframe. */
    yield put({type: deps.refresh});
    return result;
  });

  function getApiUserAttemptIds (state) {
    const {api} = state;
    const {user_id, attempt_id} = state.response;
    return {api, user_id, attempt_id};
  }

  /* When a refresh occurs and the task iframe is open, push the task data
     to it in case there is any change. */
  yield use('refreshCompleted');
  yield addSaga(function* () {
    yield takeLatest(deps.taskWindowChanged, function* ({taskWindow}) {
      if (taskWindow) {
        yield takeEvery(deps.refreshCompleted, function* () {
          const payload = yield select(getTaskWindowData);
          yield call(peer.call, taskWindow, 'updateTask', payload);
        });
      }
    });
  });

  /* This selector builds the data that is passed to the task in response to
     the 'initTask' call, and in 'loadTask' */
  function getTaskWindowData (state) {
    const {team_data} = state.response;
    const {score} = state.response.attempt;
    return {task: team_data, score};
  }

};
