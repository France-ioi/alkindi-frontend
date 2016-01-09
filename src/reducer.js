
// import {newTool} from './tool';

const initialState = {
  // toolOrder: [],
  // toolMap: {},
  // nextToolId: 1,
  // autoRefresh: true,
  // rootScope: {},
  tools: [],
  activeTabKey: undefined,
  enabledTabs: {},
  crypto: {}
};

const seedState = function (seed, oldState) {
  if (!seed)
    seed = {};
  const state = {...initialState, ...oldState, ...seed};
  const {crypto} = state;
  // If the crypto tab has not been loaded, set the initial revisionId.
  if (crypto.tools === undefined && state.my_latest_revision_id !== null) {
    state.crypto = {revisionId: state.my_latest_revision_id};
  }
  return reduceTick(reduceSetActiveTab(state));
};

const reduceTick = function (state) {
  const now = Date.now();
  const {round} = state;
  if (round !== undefined) {
    const has_not_started = now < new Date(round.training_opens_at).getTime();
    if (has_not_started !== state.has_not_started)
      state = {...state, round_has_not_started: has_not_started};
  }
  return state;
};

const reduceSetActiveTab = function (state, tabKey) {
  const haveTask = !!state.task;
  const enabledTabs = {
    team: true,
    task: haveTask,
    cryptanalysis: haveTask,
    history: false,
    answer: false
  };
  // If the active tab has become disabled, select the team tab, which is
  // always available.
  let activeTabKey = tabKey || state.activeTabKey;
  if (activeTabKey === undefined || !enabledTabs[activeTabKey])
    activeTabKey = 'team';
  return {...state, activeTabKey, enabledTabs};
}

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
      return seedState(action.seed, state);
    case 'AFTER_LOGOUT':
      return seedState();
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
    case 'SET_WORKSPACES':
      return reduceSetWorkspaces(state, action.workspaces);
    case 'SET_ACTIVE_TAB':
      return reduceSetActiveTab(state, action.tabKey);
    case 'SET_CRYPTO':
      return {...state, crypto: action.crypto};
    // case 'ADD_TOOL':
    //   return reduceAddTool(state, action.toolType, action.toolState);
    // case 'REMOVE_TOOL':
    //   return reduceRemoveTool(state, action.toolId);
    // case 'UPDATE_TOOL':
    //   return reduceUpdateTool(state, action.toolId, action.toolStateUpdate);
    // case 'STEP':
    //   return reduceStep(state);
    default:
      throw action;
  }
};

export const reduce = function (state, action) {
  const newState = actualReduce(state, action);
  // console.log('reduce', action, state, newState);
  return newState;
};

export default reduce;
