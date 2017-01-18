/* OBSOLETE FILE, NOT USED */

const initialState = {
  refreshing: true,
  request: undefined,
  response: {},
  activeTabKey: undefined,
  enabledTabs: {},
  workspace: {}
};

// XXX turn into a saga
const reduceTick = function (state) {
  // Periodic process, this executes every second and
  // at the end of every refresh.
  let newState = {...state};
  const {attempt, response, timeDelta} = state;
  const {round, task} = response;
  // Correct local time by subtracting the (local - remote) delta.
  const now = Date.now() - (timeDelta || 0);
  newState.now = now;

  // Trigger a refresh if the clock jumped by over 30 seconds.
  const lastTick = state.now;
  if (lastTick && Math.abs(now - lastTick) > 30000) {
    // We cannot call Alkindi.refresh from within the reducer because
    // it calls store.dispatch, so call it at the next tick.
    setTimeout(Alkindi.refresh, 0);
    return newState;
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

  // Switch to 'attempts' tab when the countdown elapses.
  if (state.countdown !== undefined && newState.countdown === undefined) {
    newState = reduceSetActiveTab(newState, 'attempts');
    setTimeout(Alkindi.refresh, 0);
  }

  // TODO: consider also updating the various flags that depend on the
  // current time.

  return newState;
};

const reduceUseRevision = function (state, revisionId) {
  return {...state,
    activeTabKey: 'cryptanalysis',
    workspace: {revisionId}
  };
};

const actualReduce = function (state, action) {
  switch (action.type) {
    case '@@redux/INIT':
      break;
    case 'INIT':
      return initialState;
    case 'AFTER_LOGOUT':
      return initialState;
    case 'TICK':
      return reduceTick(state);
    case 'SET_ACTIVE_TAB':
      return reduceSetActiveTab(state, action.tabKey);
    case 'SET_WORKSPACE':
      return {...state, workspace: action.workspace};
    case 'USE_REVISION':
      return reduceUseRevision(state, action.revisionId);
    case 'SHOW_MAIN_SCREEN':
      return {...state, showMainScreen: true};
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
