import React from 'react';
import {connect} from 'react-redux';
import {Alert, Button} from 'react-bootstrap';
import {Tabs, TabList, Tab, TabPanel} from 'react-tabs';
import EpicComponent from 'epic-component';
import {eventChannel, buffers} from 'redux-saga'
import {call, fork, put, take, select, takeEvery, takeLatest} from 'redux-saga/effects';

import {default as ManagedProcess, getManagedProcessState} from '../managed_process';
import getMessage from '../messages';
import Peer from '../peer';

const isDev = process.env.NODE_ENV !== 'production';

const views = [
  {key: 'task', title: "Énoncé", showTask: true},
  {key: 'solve', title: "Résoudre", showTask: true},
  {key: 'history', title: "Historique", showTask: false}
];
views.forEach(function (view, index) {
  view.index = index;
});

export default function (bundle, deps) {

  bundle.use('refresh', 'HistoryTab');

  bundle.addReducer('init', function (state, action) {
    return {...state, taskViewKey: views[0].key};
  });

  bundle.defineSelector('TaskTabSelector', function (state, _props) {
    const {taskViewKey} = state;
    const taskView = views.find(view => view.key === taskViewKey);
    const {attempt, round_task, team_data} = state.response;
    const startAttempt = getManagedProcessState(state, 'startAttempt');
    return {attempt, round_task, team_data, taskView, startAttempt};
  });

  bundle.defineView('TaskTab', 'TaskTabSelector', EpicComponent(self => {

    function refTask (element) {
      const taskWindow = element && element.contentWindow;
      self.props.dispatch({type: deps.taskWindowChanged, taskWindow});
    }

    function onStartAttempt () {
      const attempt_id = self.props.attempt.id;
      self.props.dispatch({type: deps.startAttempt, attempt_id});
    }

    function onSelectTab (index) {
      self.props.dispatch({type: deps.taskViewSelected, key: views[index].key});
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
      const {attempt, round_task, team_data, taskView} = self.props;
      if (!team_data) {
        return (
          <div className="tab-content">
            {renderStartAttempt()}
          </div>
        );
      }
      // React.createElement(deps[t.component])
      return (
        <div className="tab-content">
          <Tabs onSelect={onSelectTab} selectedIndex={taskView.index}>
            <TabList>
              {views.map(t => <Tab key={t.key} disabled={t.disabled}>{t.title}</Tab>)}
            </TabList>
            {views.map(t =>
              <TabPanel key={t.key}>
                <div></div>
              </TabPanel>)}
          </Tabs>
          {taskView.key === 'history' && <deps.HistoryTab/>}
          {false && <textarea value={JSON.stringify(round_task, null, 2)}></textarea>}
          {false && <textarea value={JSON.stringify(team_data, null, 2)}></textarea>}
          <iframe className="task" src={round_task.frontend_url} ref={refTask}
            style={{height: taskView.showTask ? '1800px' : '0'}}/>
        </div>
      );
    };

  }));

  let channel;
  bundle.defer(function (store) {
    channel = eventChannel(function (emitter) {
      return store.subscribe(function () {
        const {taskWindow, taskDirty} = store.getState();
        emitter({taskWindow, taskDirty});
      });
    }, buffers.sliding(1));
  });
  bundle.addSaga(function* () {
    while (true) {
      const {taskWindow, taskDirty} = yield take(channel);
      if (taskDirty) {
        const payload = yield select(getTaskWindowState);
        yield call(peer.call, taskWindow, 'pushState', payload);
        yield put({type: deps.taskStateSynced})
      }
    }
  });

  bundle.defineAction('taskViewSelected', 'Task.View.Selected');
  bundle.addReducer('taskViewSelected', function (state, action) {
    const {key} = action;
    return {...state, taskViewKey: key, taskDirty: true};
  });

  bundle.use('startAttempt', 'buildRequest', 'managedRefresh');
  bundle.include(ManagedProcess('startAttempt', 'Attempt.Start', p => function* (action) {
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
      yield p.success({type: deps.taskStateSynced});
    } else {
      yield p.failure(result.error);
    }
  }));

  bundle.defineAction('taskWindowChanged', 'Task.Window.Changed');
  bundle.addReducer('taskWindowChanged', function (state, action) {
    const {taskWindow} = action;
    return {...state, taskWindow, taskDirty: false};
  });

  bundle.defineAction('taskStateSynced', 'Task.State.Pulled');
  bundle.addReducer('taskStateSynced', function (state, action) {
    return {...state, taskDirty: false};
  });

  //
  // Handle communication with the task's iframe.
  //

  const peer = Peer();
  bundle.addSaga(peer.handleIncomingActions);

  peer.on('pullState', function* pullState () {
    const result = yield select(getTaskWindowState);
    yield put({type: deps.taskStateSynced});
    return result;
  });

  /* Pass answer submissions from the task to the backend. */
  peer.on('submitAnswer', function* submitAnswer (payload) {
    const {api, user_id, attempt_id} = yield select(getApiUserAttemptIds);
    let result;
    try {
      result = yield call(api.submitAnswer, user_id, attempt_id, payload);
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
    /* Perform a refresh to update the task and push to the iframe,
       then end the saga to send the result (the task will close the
       hint request interface). */
    const refreshRequest = yield select(deps.buildRequest);
    yield call(deps.managedRefresh, refreshRequest);
    return result;
  });

  peer.on('storeRevision', function* storeRevision (revision) {
    const {api, user_id, attempt_id} = yield select(getApiUserAttemptIds);
    let result;
    try {
      result = yield call(api.storeRevision, user_id, attempt_id, revision);
    } catch (ex) {
      return {success: false, error: 'server error'};
    }
    /* Perform a refresh to update the list of revisions and push to the iframe.
       then end the saga to pass the result (including the revision_id). */
    const refreshRequest = yield select(deps.buildRequest);
    yield call(deps.managedRefresh, refreshRequest);
    return result;
  });

  function getApiUserAttemptIds (state) {
    const {api} = state;
    const {user_id, attempt_id} = state.response;
    return {api, user_id, attempt_id};
  }

  /* When a refresh occurs and the task iframe is open, push the task data
     to it in case there is any change. */
  bundle.use('refreshCompleted', 'revisionSelected');
  bundle.addSaga(function* () {
    yield takeLatest(deps.taskWindowChanged, function* ({taskWindow}) {
      if (taskWindow) {
        yield takeEvery(deps.refreshCompleted, function* () {
          const payload = yield select(getTaskAndScore);
          // TODO: push task, score only
          yield call(peer.call, taskWindow, 'pushState', payload);
        });
        yield takeEvery(deps.revisionSelected, function* (action) {
          const revision = yield select(getCurrentRevision);
          yield call(peer.call, taskWindow, 'pushState', {revision});
          yield put({type: deps.taskViewSelected, key: 'solve'});
        });
      }
    });
  });

  /* This selector builds the data that is passed to the task in response to
     the 'initTask' call, and in 'loadTask' */
  function getTaskWindowState (state) {
    const {response, revision, revisions, taskViewKey} = state;
    const {team_data, my_latest_revision_id} = response;
    const {score} = response.attempt;
    return {
      view: taskViewKey,
      task: team_data,
      revision: revisions[revision.revisionId],
      score
    };
  }

  function getTaskAndScore (state) {
    const {team_data, attempt} = state.response;
    return {
      task: team_data,
      score: attempt.score
    };
  }

  function getCurrentRevision (state) {
    const {revision, revisions} = state;
    return revisions[revision.revisionId];
  }

};
