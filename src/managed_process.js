
import {defineAction, addReducer, addSaga} from 'epic-linker';
import {call, put, take, select} from 'redux-saga/effects';

export default ManagedProcess;

function ManagedProcess (namePrefix, typePrefix, preSaga) {
  const p = {
    triggerAction: namePrefix,
    trigger: typePrefix,
    startedAction: `${namePrefix}Started`,
    started: `${typePrefix}.Started`,
    succeededAction: `${namePrefix}Succeeded`,
    succeeded: `${typePrefix}.Succeeded`,
    failedAction: `${namePrefix}Failed`,
    failed: `${typePrefix}.Failed`,
    success: () => put({type: p.succeeded}),
    failure: (error) => put({type: p.failed, error})
  };
  const saga = preSaga(p);
  return function* () {
    yield defineAction(p.triggerAction, p.trigger);
    yield defineAction(p.startedAction, p.started);
    yield defineAction(p.succeededAction, p.succeeded);
    yield defineAction(p.failedAction, p.failed);
    yield addReducer(p.startedAction, function (state, _action) {
      return {...state, pendingAction: namePrefix, lastAction: undefined, lastError: undefined};
    });
    yield addReducer(p.failedAction, function (state, action) {
      const {error} = action;
      return {...state, pendingAction: false, lastAction: namePrefix, lastError: error};
    });
    yield addReducer(p.succeededAction, function (state, action) {
      return {...state, pendingAction: false, lastAction: namePrefix, lastError: false};
    });
    yield addSaga(function* () {
      while (true) {
        // Wait for the trigger.
        const action = yield take(p.trigger);
        // Ignore the trigger if an action is already pending.
        const pendingAction = yield select(state => state.pendingAction);
        if (!pendingAction) {
          // Put the 'started' action.
          yield put({type: p.started});
          try {
            // Call the saga.  It must yield p.success() or p.failure(error).
            yield call(saga, action);
          } catch (ex) {
            console.log(ex);
            yield p.failure('programming error');
          }
        }
      }
    });
  };
};

export const clearManagedProcessState = ManagedProcess.clearState = function (state) {
  return {...state, pendingAction: false, lastAction: undefined, lastError: undefined};
};

export const getManagedProcessState = ManagedProcess.getState = function (state, name) {
  if (state.pendingAction === name) {
    return {pending: true};
  }
  if (state.lastAction === name) {
    if (state.lastError === false) {
      return {success: true};
    } else {
      return {error: state.lastError};
    }
  }
  return {};
};
