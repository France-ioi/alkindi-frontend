
// import {newTool} from './tool';

const initialState = {
  tools: [],
  activeTabKey: undefined,
  enabledTabs: {},
  crypto: {},
  refreshing: true
};

const seedProps = ['user', 'team', 'round', 'attempt', 'task', 'my_latest_revision_id'];

const reduceInit = function (state, refresh) {
  return {...state, refresh};
};

const reduceBeginRefresh = function (state, user_id) {
  return {...state, refreshing: true};
};

const reduceEndRefresh = function (state, seed) {
  if (!seed)
    seed = {};
  const newState = {...initialState, ...state, refreshing: false}; // XXX need refresh semaphore
  // Clear the crypto tab when the attempt changes.
  if ('attempt' in state && 'attempt' in seed && state.attempt.id !== seed.attempt.id) {
    newState.crypto = {};
  }
  // Overwrite state with seed, even missing seed props.
  seedProps.forEach(function (key) {
    newState[key] = seed[key];
  })
  const {crypto} = newState;
  // If the crypto tab has not been loaded, set the initial revisionId.
  if (crypto.tools === undefined && newState.my_latest_revision_id !== null) {
    newState.crypto = {revisionId: newState.my_latest_revision_id};
  }
  return reduceTick(reduceSetActiveTab(newState));
};

const reduceTick = function (state) {
  // Periodic process, this executes every second and
  // at the end of every refresh.
  const now = Date.now();
  const newState = {...state, now};
  const {round, attempt, task} = state;
  if (round !== undefined) {
    newState.round_has_not_started =
      now < new Date(round.training_opens_at).getTime();
  }
  // Update the countdown.
  newState.countdown = undefined;
  if (attempt !== undefined && task !== undefined) {
    if (attempt['closes_at']) {
      const attempt_close_time = new Date(attempt['closes_at']).getTime();
      newState.countdown = attempt_close_time - now;
    }
  }
  return newState;
};

const reduceSetActiveTab = function (state, tabKey) {
  const haveTask = !!state.task;
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

const reduceSetUser = function (state, user) {
  return {...state, user};
};

const reduceSetTeam = function (state, team) {
  return {...state, team};
};

const reduceSetRound = function (state, round) {
  // Force a tick to update round_has_not_started.
  return reduceTick({...state, round: round});
};

const reduceSetAttempt = function (state, attempt) {
  return {...state, attempt};
};

const reduceSetTask = function (state, task) {
  return {...state, task};
};

const reduceSetTools = function (state, tools) {
  return {...state, tools};
};

const reduceSetWorkspaces = function (state, workspaces) {
  const currentWorkspace = undefined;
  // TODO: retain currentWorkspace based on historyTab.currentWorkspace.id
  // being present in workspaces
  // const {historyTab} = state;
  const newHistoryTab = {
    workspaces,
    currentWorkspace
  };
  if (currentWorkspace === undefined) {
    let groups = workspaces.map(w => w.versions.map(v => { return {...v, workspace: w}; }));
    groups = groups.sort((v1, v2) => new Date(v1.updatedAt) < new Date(v2.updatedAt));
    newHistoryTab.allVersions = Array.prototype.concat.apply([], groups);
  }
  return {...state, historyTab: newHistoryTab};
};

const reduceAddTool = function (state, toolType, toolState) {
  return state; // XXX disabled
  const tool = newTool(toolType, toolState);
  const {nextToolId, toolPointer, toolMap, toolOrder} = state;
  const toolId = 't' + nextToolId;
  const toolIndex = toolOrder.length;
  // Set the tool pointer to the new tool unless already computing.
  const newToolPointer = toolPointer === undefined ? toolIndex : toolPointer;
  return {
    ...state,
    nextToolId: nextToolId + 1,
    toolPointer: newToolPointer,
    toolMap: {...toolMap, [toolId]: {...tool, id: toolId}},
    toolOrder: [...toolOrder, toolId]
  };
};

const reduceRemoveTool = function (state, toolId) {
  const {toolMap, toolOrder, toolPointer} = state;
  // Find the tool's index in toolOrder.
  const i = toolOrder.indexOf(toolId);
  if (i === -1)
    return state;
  // Remove from toolOrder.
  const newToolOrder = [...toolOrder.slice(0, i), ...toolOrder.slice(i + 1)];
  // Update the toolPointer.
  let newToolPointer = (toolPointer >= i) ? toolPointer - 1 : toolPointer;
  if (newToolPointer >= newToolOrder.length)
    newToolPointer = undefined;
  // Make a copy of toolMap without the tool being removed.
  const newToolMap = {...toolMap};
  delete toolMap[toolId];
  return {
    ...state,
    toolPointer: newToolPointer,
    toolOrder: newToolOrder,
    toolMap: newToolMap
  };
};

const reduceUpdateTool = function (state, toolId, toolStateUpdate) {
  const {toolPointer, toolOrder, toolMap} = state;
  const toolIndex = toolOrder.indexOf(toolId);
  const newToolPointer = (toolPointer === undefined || toolIndex < toolPointer) ? toolIndex : toolPointer;
  const tool = toolMap[toolId];
  const newToolState = tool.mergeState(tool.state, toolStateUpdate);
  return {
    ...state,
    toolPointer: newToolPointer,
    toolMap: {
      ...toolMap,
      [toolId]: {...tool, state: newToolState}
    }
  };
};

const reduceStep = function (state) {
  const {toolOrder, toolPointer, toolMap, rootScope} = state;
  // Do nothing if the tool pointer is out of range.
  if (toolPointer === undefined)
    return state;
  // Get the input scope (rootScope or previous instructions' outputScope).
  const inputScope = toolPointer === 0 ? rootScope : toolMap[toolOrder[toolPointer - 1]].outputScope;
  // Build a fresh output scope.
  const outputScope = Object.create(inputScope);
  // Get the tool.
  const toolId = toolOrder[toolPointer];
  const tool = toolMap[toolId];
  // Let the computation write to the new output scope.
  tool.compute(tool.state, outputScope);
  // Increment the tool pointer.
  let newToolPointer = toolPointer + 1;
  if (newToolPointer === toolOrder.length)
    newToolPointer = undefined;
  // Return the updated state.
  return {
    ...state,
    toolPointer: newToolPointer,
    toolMap: {
      ...toolMap,
      [toolId]: {...tool, outputScope}
    }
  };
};

const actualReduce = function (state, action) {
  switch (action.type) {
    case '@@redux/INIT':
    case 'INIT':
      return reduceInit(state, action.refresh);
    case 'BEGIN_REFRESH':
      return reduceBeginRefresh(state, action.user_id);
    case 'END_REFRESH':
      return reduceEndRefresh(state, action.seed);
    case 'AFTER_LOGOUT':
      return reduceSeed(state, undefined);
    case 'TICK':
      return reduceTick(state);
    case 'SET_USER':
      return reduceSetUser(state, action.user);
    case 'SET_TEAM':
      return reduceSetTeam(state, action.team);
    case 'SET_ROUND':
      return reduceSetRound(state, action.round);
    case 'SET_ATTEMPT':
      return reduceSetAttempt(state, action.attempt);
    case 'SET_TASK':
      return reduceSetTask(state, action.task);
    // case 'SET_WORKSPACES':
    //   return reduceSetWorkspaces(state, action.workspaces);
    case 'SET_ACTIVE_TAB':
      return reduceSetActiveTab(state, action.tabKey);
    case 'SET_CRYPTO':
      return {...state, crypto: action.crypto};
    case 'USE_REVISION':
      return reduceUseRevision(state, action.revision_id);
    // case 'ADD_TOOL':
    //   return reduceAddTool(state, action.toolType, action.toolState);
    // case 'REMOVE_TOOL':
    //   return reduceRemoveTool(state, action.toolId);
    // case 'UPDATE_TOOL':
    //   return reduceUpdateTool(state, action.toolId, action.toolStateUpdate);
    // case 'STEP':
    //   return reduceStep(state);
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
