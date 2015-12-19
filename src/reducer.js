
import {importText, importSubstitution, applySubstitution, errorValue} from './values';
import {newTool} from './tool';

const initialState = function () {
  return {
    toolOrder: [],
    toolMap: {},
    nextToolId: 1,
    autoRefresh: true,
    rootScope: {},
    user: {
      isSelected: false
    },
    team: undefined,
    activeTabKey: undefined
  };
};

const reduceSetUser = function (state, user) {
  return {...state, user};
};

const reduceSetTeam = function (state, team) {
  return {...state, team};
};

const reduceSetQuestion = function (state, question) {
  return {...state, question};
};

const reduceSetActiveTab = function (state, tabKey) {
  return {
    ...state,
    activeTabKey: tabKey
  };
};

const reduceAddTool = function (state, toolType, toolState) {
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

export default function reduce (state, action) {
  // console.log('reduce', JSON.stringify(action));
  switch (action.type) {
    case '@@redux/INIT':
    case 'INIT':
      console.log('initial state');
      return initialState();
    case 'SET_USER':
      return reduceSetUser(state, action.user);
    case 'SET_TEAM':
      return reduceSetTeam(state, action.team);
    case 'SET_QUESTION':
      return reduceSetQuestion(state, action.question);
    case 'SET_ACTIVE_TAB':
      return reduceSetActiveTab(state, action.tabKey);
    case 'ADD_TOOL':
      return reduceAddTool(state, action.toolType, action.toolState);
    case 'REMOVE_TOOL':
      return reduceRemoveTool(state, action.toolId);
    case 'UPDATE_TOOL':
      return reduceUpdateTool(state, action.toolId, action.toolStateUpdate);
    case 'STEP':
      return reduceStep(state);
    default:
      console.log('dropped unknown action', action);
  }
  return state;
};
