
const initialState = {
  refreshing: true,
  request: undefined,
  response: {},
  activeTabKey: undefined,
  enabledTabs: {},
  crypto: {}
};

const seedProps = ['user', 'team', 'round', 'attempt', 'task', 'my_latest_revision_id'];

const reduceInit = function (state) {
  return {...state};
};

const reduceBeginRefresh = function (state, action) {
  const {user_id, request} = action;
  return {...state, refreshing: true, user_id, request};
};

const reduceCancelRefresh = function (state) {
  return {...state, refreshing: false};
};

const reduceEndRefresh = function (state, action) {
  const {user_id, request, response} = action;
  // Discart a response to a stale request, but not the initial seeding.
  if (state.request && !(state.user_id == user_id && state.request === request))
    return state;
  const newState = {...state, refreshing: false, response: response};
  // TODO: check action.frontend_version.
  // Seed with the user id from the response.
  if (state.request === undefined && response.user !== undefined)
    newState.user_id = response.user.id;
  // Set an attempt based on attempts, current_attempt_id.
  const {attempts, current_attempt_id} = response;
  if (attempts && current_attempt_id)  {
    newState.attempt = attempts.find(attempt => attempt.id == current_attempt_id);
  } else {
    newState.attempt = undefined;
  }
  // Clear the crypto tab when the current attempt changes.
  const attempt = newState.attempt;
  if (state.attempt && state.attempt.id !== current_attempt_id) {
    newState.crypto = {};
  }
  // If the crypto tab has not been loaded, set the initial revisionId.
  const {crypto} = newState;
  if (crypto.tools === undefined && response.my_latest_revision_id !== null) {
    newState.crypto = {revisionId: response.my_latest_revision_id};
  }
  return reduceTick(reduceSetActiveTab(newState));
};

const reduceTick = function (state) {
  // Periodic process, this executes every second and
  // at the end of every refresh.
  const now = Date.now();
  // TODO: check if (now - previous now) > 30 seconds,
  //       if so refresh time delta from server.
  let newState = {...state, now};
  const {round, attempt, task} = state.response;
  if (round !== undefined) {
    // TODO: correct time using a time delta from server.
    newState.round_has_not_started =
      now < new Date(round.training_opens_at).getTime();
  }
  // Update the countdown.
  newState.countdown = undefined;
  if (attempt !== undefined && task !== undefined) {
    if (attempt['closes_at']) {
      const attempt_close_time = new Date(attempt['closes_at']).getTime();
      const countdown = attempt_close_time - now;
      if (countdown >= 0)
        newState.countdown = countdown;
    }
  }
  // Switch to team tab when the countdown elapses.
  if (state.countdown !== undefined && newState.countdown === undefined) {
    newState = reduceSetActiveTab(newState, 'team');
    setTimeout(function () {
      Alkindi.refresh();
    }, 0);
  }
  return newState;
};

const reduceSetActiveTab = function (state, tabKey) {
  const haveTask = !!state.response.task;
  const enabledTabs = {
    team: true,
    task: haveTask,
    cryptanalysis: haveTask,
    history: haveTask,
    answers: haveTask
  };
  // If the active tab has become disabled, select the team tab, which is
  // always available.
  let activeTabKey = tabKey || state.activeTabKey;
  if (activeTabKey === undefined || !enabledTabs[activeTabKey])
    activeTabKey = 'team';
  return {...state, activeTabKey, enabledTabs};
};

const reduceUseRevision = function (state, revision_id) {
  return {...state,
    activeTabKey: 'cryptanalysis',
    crypto: {...state.crypto,
      tools: undefined,
      revisionId: revision_id,
      changed: false
    }
  };
};

const actualReduce = function (state, action) {
  switch (action.type) {
    case '@@redux/INIT':
      break;
    case 'INIT':
      return initialState;
    case 'BEGIN_REFRESH':
      return reduceBeginRefresh(state, action);
    case 'END_REFRESH':
      return reduceEndRefresh(state, action);
    case 'CANCEL_REFRESH':
      return reduceCancelRefresh(state);
    case 'AFTER_LOGOUT':
      return reduceSeed(state, undefined);
    case 'TICK':
      return reduceTick(state);
    case 'SET_ACTIVE_TAB':
      return reduceSetActiveTab(state, action.tabKey);
    case 'SET_CRYPTO':
      return {...state, crypto: action.crypto};
    case 'USE_REVISION':
      return reduceUseRevision(state, action.revision_id);
    default:
      throw 'unhandled action ' + action.type;
  }
};

export const reduce = function (state, action) {
  const newState = actualReduce(state, action);
  // console.log('reduce', action, state, newState);
  return newState;
};

export default reduce;
