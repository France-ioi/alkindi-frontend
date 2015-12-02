
import deepmerge from 'deepmerge';

import {importText, importSubstitution, applySubstitution, errorValue} from './values';
import {envLookup, envStore} from './environment';
import {newTool, invalidateTool, runTool} from './tool';

const initialState = function () {
  return {
    score: 300,
    maxScore: 300,
    alphabets: {},
    environment: {},
    controls: [],
    toolOrder: [],
    toolMap: {},
    nextToolId: 1,
    autoRefresh: true
  };
}

const reduceImportText = function (state, data) {
  const alphabet = state.alphabets[data.alphabet];
  const value = importText(alphabet, data.text, data.qualifier);
  return envStore(state, data.name, value);
};

const reduceImportSubstitution = function (state, data) {
  const sourceAlphabet = state.alphabets[data.sourceAlphabet];
  const targetAlphabet = state.alphabets[data.targetAlphabet];
  const value = importSubstitution(sourceAlphabet, targetAlphabet, data.pairs);
  return envStore(state, data.name, value);
};

const reduceCompute = function (state, operation, data) {
  // TODO: add an operations registry
  switch (operation) {
    case 'substitute':
      let text = envLookup(state, data.source);
      let substitution = envLookup(state, data.substitution);
      let value = applySubstitution(substitution, text);
      return envStore(state, data.destination, value);
  }
  console.log('dropped unknown COMPUTE action', operation);
  return state;
};

const reorderTools = function (state) {
  // TODO: fix toolOrder so that each tool's inputs are outputs of
  // tools that appear earlier in the order?
  return state;
};

const reduceAddTool = function (state, data) {
  const id = 't' + state.nextToolId;
  const newState = {
    ...state,
    nextToolId: state.nextToolId + 1,
    toolMap: {...state.toolMap, [id]: newTool(data.type)},
    toolOrder: [...state.toolOrder, id]
  };
  return reduceUpdateTool(newState, id, data);
};

const reduceRemoveTool = function (state, id) {
  // Invalidate the tool before removal to propagate any outputs that are
  // no longer defined.
  state = invalidateTool(state, id);
  // Find the tool's index in toolOrder.
  let {toolMap, toolOrder} = state;
  const i = toolOrder.indexOf(id);
  if (i === -1)
    return state;
  // Remove the id from toolOrder.
  toolOrder = [...toolOrder.slice(0, i), ...toolOrder.slice(i + 1)];
  // Make a copy of toolMap without the pair being removed.
  toolMap = {...toolMap}
  delete toolMap[id];
  return {...state, toolMap, toolOrder};
};

const reduceUpdateTool = function (state, id, data) {
  // Invalidate the tool before we change its configuration, to propagate
  // outputs that become undefined (as happens in the case of an output
  // variable name change).
  state = invalidateTool(state, id);
  const toolMap = state.toolMap;
  const tool = toolMap[id];
  const updatedTool = deepmerge(tool, data);
  state = {
    ...state,
    toolMap: {
      ...toolMap,
      [id]: updatedTool
    }
  };
  // Invalidate the tool again after we change its configuration, to propagate
  // any newly defined outputs.
  return invalidateTool(state, id);
};

const reduceRefreshTool = function (state, id) {
  const {toolMap, environment} = state;
  const tool = toolMap[id];
  const outputEnv = runTool(tool, environment);
  return {
    ...state,
    environment: {...environment, ...outputEnv},
    toolMap: {
      ...toolMap,
      [id]: {...tool, invalidated: false}
    }
  };
};

export default function reduce (state, action) {
  window.state = state;
  switch (action.type) {
    case '@@redux/INIT':
      return initialState();
    case 'IMPORT_TEXT':
      return reduceImportText(state, action.data);
    case 'IMPORT_SUBSTITUTION':
      return reduceImportSubstitution(state, action.data);
    case 'STORE':
      return envStore(state, action.name, action.value);
    case 'COMPUTE':
      return reduceCompute(state, action.operation, action.data);
    case 'ADD_TOOL':
      return reduceAddTool(state, action.data);
    case 'REMOVE_TOOL':
      return reduceRemoveTool(state, action.id);
    case 'UPDATE_TOOL':
      return reduceUpdateTool(state, action.id, action.data);
    case 'REFRESH_TOOL':
      return reduceRefreshTool(state, action.id);
    default:
      console.log('dropped unknown action', action);
  }
  return state;
};
