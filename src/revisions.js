
import {takeLatest, select, call, put} from 'redux-saga/effects';
import update from 'immutability-helper';

export default function (bundle, deps) {

  bundle.use('refreshCompleted');

  bundle.defineAction('revisionLoaded', 'Revision.Loaded');

  bundle.addReducer('init', function (state, action) {
    return {...state, revisions: []};
  });

  bundle.addReducer('revisionLoaded', function (state, action) {
    const {revision} = action;
    return update(state, {revisions: {[revision.id]: {$set: revision}}});
  });

  bundle.addSaga(function* () {
    yield takeLatest(deps.refreshCompleted, function* (action) {
      const {response} = action;
      const attemptId = response.attempt_id;
      const revisionId = response.my_latest_revision_id;
      // revisionId can be undefined, null, or a number.
      if (typeof revisionId === 'number') {
        console.log('loading current revision', revisionId);
        const {api, isNeeded} = yield select(isRevisionNeeded, revisionId);
        if (isNeeded) {
          const result = yield call(api.loadRevision, revisionId);
          yield put({type: deps.revisionLoaded, attemptId, revision: result.workspace_revision});
        }
      }
    });
  });

  function isRevisionNeeded (state, revisionId) {
    if (state.revisions[revisionId]) {
      return {};
    }
    return {api: state.api, isNeeded: true};
  }

};
