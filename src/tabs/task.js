import React from 'react';
import {connect} from 'react-redux';
import {Alert, Button} from 'react-bootstrap';
import {defineAction, defineSelector, defineView, include, use} from 'epic-linker';
import EpicComponent from 'epic-component';
import {select, call, put} from 'redux-saga/effects';

import {default as ManagedProcess, getManagedProcessState} from '../managed_process';
import getMessage from '../messages';

export default function* (deps) {

  yield defineSelector('TaskTabSelector', function (state, _props) {
    const {attempt, round_task, task} = state.response;
    const isTeamLocked = false; // XXX
    const startAttempt = getManagedProcessState(state, 'startAttempt');
    return {attempt, round_task, task, isTeamLocked, startAttempt};
  });

  yield defineView('TaskTab', 'TaskTabSelector', EpicComponent(self => {

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
              accéder au sujet{' '}
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
      const {attempt, round_task, task, isTeamLocked} = self.props;
      if (!task) {
        return (
          <div className="tab-content">
            {renderStartAttempt()}
            <p>attempt: <tt>{JSON.stringify(attempt)}</tt></p>
            <p>round_task: <tt>{JSON.stringify(round_task)}</tt></p>
          </div>
        );
      }
      return (
        <div className="tab-content">
          <p>{JSON.stringify(task)}</p>
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

};
