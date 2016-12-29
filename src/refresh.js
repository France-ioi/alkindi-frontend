
import {use, defineAction, addSaga, addReducer, defineSelector, defineView} from 'epic-linker';
import React from 'react';
import EpicComponent from 'epic-component';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';
import {takeLatest} from 'redux-saga';
import {select, call, put} from 'redux-saga/effects';

export default function* (deps) {

  yield use('login');

  yield defineAction('refresh', 'Refresh');
  yield defineAction('refreshStarted', 'Refresh.Started');
  yield defineAction('refreshSucceeded', 'Refresh.Succeeded');
  yield defineAction('refreshFailed', 'Refresh.Failed');

  yield addSaga(function* () {
    yield takeLatest(deps.refresh, doRefresh);
  });

  function* doRefresh (action) {
    try {
      const timestamp = new Date();
      const {userId, request, api} = yield select(getRefreshState);
      yield put({type: deps.refreshStarted, timestamp});
      const response = yield call(api.refresh, userId, request);
      yield put({type: deps.refreshSucceeded, timestamp, response});
    } catch (ex) {
      // XXX test this code
      console.log('refresh failed', ex);
      let message;
      if (ex.err) {
        if (ex.err.status == 403) {
          // XXX put an action instead of displaying an alert synchronously.
          alert("Vous êtes déconnecté, reconnectez-vous pour continuer.");
          yield put({type: deps.login});
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
      yield put({type: deps.refreshFailed, timestamp, message});
    }
  }

  yield addReducer('refreshStarted', function (state, action) {
    return {...state, refreshing: true};
  });

  yield addReducer('refreshSucceeded', function (state, action) {
    const {timestamp, response} = action;
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

  yield addReducer('refreshFailed', function (state, action) {
    return {...state, refreshing: false};
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