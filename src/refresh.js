
import {use, defineAction, addSaga, addReducer} from 'epic-linker';
import {takeLatest} from 'redux-saga';

export default function* (deps) {

  yield use('login');

  yield defineAction('refresh', 'Refresh');
  yield defineAction('refreshStarted', 'Refresh.Started');
  yield defineAction('refreshSucceeded', 'Refresh.Succeeded');
  yield defineAction('refreshFailed', 'Refresh.Failed');

  yield addSaga(function* () {
    yield takeLatest('refresh', doRefresh);
  });

  function* doRefresh (action) {
    console.log('refresh', action);
    try {
      const timestamp = new Date();
      const {userId, request, api} = yield select(getRefreshState);
      yield put({type: deps.refreshStarted, timestamp});
      const response = yield call(api.refresh, userId, request);
      yield put({type: deps.refreshCompleted, timestamp, response});
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
    console.log('refresh started', action);
    return {...state, refreshing: true};
  });

  yield addReducer('refreshSucceeded', function (state, action) {
    const {response} = action;
    const newState = {...state, refreshing: false, response};
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

};