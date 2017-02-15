
import {takeLatest, select, call, put} from 'redux-saga/effects';
import update from 'immutability-helper';

export default function (bundle, deps) {

  bundle.addReducer('init', function (state, action) {
    return {...state,
      revision: {},
      revisions: []
    };
  });

  /* After a refresh:
     - if there is no selected revision, set the latest revision as the next one
     - if the next revision is not loaded, set it to be loaded
       - mar

     automatically select the latest revision. */
  bundle.use('refreshCompleted');
  bundle.addReducer('refreshCompleted', function (state, action) {
    const {response} = action;
    const {revision} = state;
    const attemptId = response.attempt_id;
    /* When the attempt changes, clear the current revision. */
    if (revision.attemptId !== attemptId) {
      state = {...state, revision: {attemptId}, taskViewKey: 'task'};
    }
    return state;
  });

  bundle.addSaga(function* () {
    yield takeLatest(deps.refreshCompleted, function* (action) {
      const {revision, revisions, response} = yield select(state => state);
      let {revisionId} = revision;
      if (revisionId === undefined) {
        /* Default to the user's latest revision. */
        revisionId = response.my_latest_revision_id;
      }
      if (revisionId !== undefined && revisionId !== null) {
        if (revisions[revisionId] === undefined) {
          yield put({type: deps.loadRevision, revisionId});
        } else if (revision.revisionId !== revisionId) {
          yield put({type: deps.revisionSelected, revisionId});
        }
      }
    });
  });

  bundle.defineAction('loadRevision', 'Revision.Load');
  bundle.addSaga(function* () {
    yield takeLatest(deps.loadRevision, function* (action) {
      const {revisionId} = action;
      const revisions = yield select(state => state.revisions);
      if (revisions[revisionId] === undefined) {
        const api = yield select(state => state.api);
        const result = yield call(api.loadRevision, revisionId);
        yield put({type: deps.revisionLoaded, revision: result.workspace_revision});
      }
      yield put({type: deps.revisionSelected, revisionId});
    });
  });

  bundle.defineAction('revisionLoaded', 'Revision.Loaded');
  bundle.addReducer('revisionLoaded', function (state, action) {
    const {revision} = action;
    return update(state, {
      revisions: {[revision.id]: {$set: revision}},
    });
  });

  bundle.defineAction('revisionSelected', 'Revision.Selected');
  bundle.addReducer('revisionSelected', function (state, action) {
    const {revisionId} = action;
    return update(state, {
      revision: {revisionId: {$set: revisionId}}
    });
  });

};
