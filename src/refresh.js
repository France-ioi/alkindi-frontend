
import React from 'react';
import EpicComponent from 'epic-component';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';
import {takeLatest, select, call, put, take, actionChannel, cancelled} from 'redux-saga/effects';

export default function (bundle, deps) {

  bundle.use('loginExpired');

  bundle.defineAction('refresh', 'Refresh');
  bundle.defineAction('refreshStarted', 'Refresh.Started');
  bundle.defineAction('refreshCompleted', 'Refresh.Completed');

  bundle.addSaga(function* () {
    yield takeLatest(deps.refresh, doRefresh);
  });

  bundle.defineValue('buildRequest', function (state, request) {
    return {...state.request, ...request};
  });

  bundle.defineValue('managedRefresh', function* managedRefresh (request) {
    const chan = yield actionChannel(deps.refreshCompleted);
    yield put({type: deps.refresh, request});
    // TODO: add a refresh timeout!
    try {
      while (true) {
        let refresh = yield take(chan);
        if (refresh && refresh.request === request) {
          return refresh.success;
        }
      }
    } finally {
      chan.close();
    }
  });

  function* doRefresh (action) {
    const timestamp = new Date();
    let {request, api} = yield select(getRefreshState);
    // A 'request' property in the request overrides the current request.
    if ('request' in action) {
      request = action.request;
    }
    try {
      yield put({type: deps.refreshStarted, timestamp});
      const response = yield call(api.refresh, request);
      yield put({type: deps.refreshCompleted, success: true, timestamp, request, response});
    } catch (ex) {
      // XXX test this code
      console.log('refresh failed', ex);
      let message;
      if (ex.err) {
        if (ex.err.status == 403) {
          yield put({type: deps.loginExpired});
          return;
        }
        message = ex.err.toString();
      } else {
        if (ex.res) {
          message = `${ex.res.statusCode} ${ex.res.statusText}`;
        } else {
          message = ex.toString();
        }
      }
      yield put({type: deps.refreshCompleted, success: false, timestamp, request, message});
    }
  }

  bundle.addReducer('refreshStarted', function (state, action) {
    return {...state, refreshing: true};
  });

  bundle.addReducer('refreshCompleted', function (state, action) {
    const {timestamp, response, success} = action;
    if (!success) {
      return {...state, refreshing: false};
    }
    const newState = {...state, refreshing: false, refreshedAt: timestamp, response};
    /* Set the current user id from the response. */
    newState.request = {
      ...state.request,
      user_id: response.user_id,
      participation_id: response.participation_id,
      attempt_id: response.attempt_id
    }
    if (response.now) {
      /* Save a relative time offset (local - remote) in milliseconds. */
      newState.timeDelta = Date.now() - (new Date(response.now)).getTime();
    }
    return newState;
  });

  function getRefreshState (state) {
    /* The config.override object overrides the request. */
    const {request, config, api} = state;
    return {request: {...request, ...config.override}, api};
  }

  function RefreshButtonSelector (state, _props) {
    const {refreshing} = state;
    return {refreshing};
  }

  bundle.defineView('RefreshButton', RefreshButtonSelector, EpicComponent(self => {
    const onClick = function () {
      self.props.dispatch({type: deps.refresh});
    };
    self.render = function () {
      const refreshing = self.props.refreshing;
      const classes = refreshing ? ['fa','fa-spinner','fa-spin'] : ['fa','fa-refresh'];
      return (
        <Button bsStyle='primary' onClick={onClick} disabled={refreshing}>
          <i className={classnames(classes)}/>
        </Button>
      );
    };
  }));

};