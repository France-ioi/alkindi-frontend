
import {use, defineAction, addSaga, addReducer, defineSelector, defineView} from 'epic-linker';
import React from 'react';
import EpicComponent from 'epic-component';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';
import {takeLatest, select, call, put} from 'redux-saga/effects';

export default function* (deps) {

  yield use('loginExpired');

  yield defineAction('refresh', 'Refresh');
  yield defineAction('refreshStarted', 'Refresh.Started');
  yield defineAction('refreshCompleted', 'Refresh.Completed');

  yield addSaga(function* () {
    yield takeLatest(deps.refresh, doRefresh);
  });

  yield defineSelector('buildRequest', function (state, request) {
    return {...state.request, ...request};
  });

  function* doRefresh (action) {
    const timestamp = new Date();
    let {userId, request, api} = yield select(getRefreshState);
    // A 'request' property in the request overrides the current request.
    if ('request' in action) {
      request = action.request;
    }
    try {
      yield put({type: deps.refreshStarted, timestamp});
      const response = yield call(api.refresh, userId, request);
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
      console.log('putting refreshCompleted');
      yield put({type: deps.refreshCompleted, success: false, timestamp, request, message});
    }
  }

  yield addReducer('refreshStarted', function (state, action) {
    return {...state, refreshing: true};
  });

  yield addReducer('refreshCompleted', function (state, action) {
    const {timestamp, response, success} = action;
    if (!success) {
      return {...state, refreshing: false};
    }
    const newState = {...state, refreshing: false, refreshedAt: timestamp, response};
    if (state.request === undefined && response.user !== undefined) {
      /* Set the current user id from the response. */
      newState.userId = response.user.id;
    }
    if (response.now) {
      /* Save a relative time offset (local - remote) in milliseconds. */
      newState.timeDelta = Date.now() - (new Date(response.now)).getTime();
    }
    return newState;
  });

  function getRefreshState (state) {
    const {userId, request, override, api} = state;
    return {userId, request: {...request, ...override}, api};
  }

  yield defineSelector('RefreshButtonSelector', function (state, _props) {
    const {refreshing} = state;
    return {refreshing};
  });

  yield defineView('RefreshButton', 'RefreshButtonSelector', EpicComponent(self => {
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