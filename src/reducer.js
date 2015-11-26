
import {importText, importSubstitution, applySubstitution, errorValue} from './values';
import {envLookup, envStore} from './environment';

export function initialState () {
  return {
    score: 300,
    maxScore: 300,
    alphabets: {},
    environment: {},
    controls: [],
    toolOrder: [],
    toolMap: {},
    nextToolId: 1
  };
}

const reduceImportText = function (state, data) {
  const alphabet = state.alphabets[data.alphabet];
  const value = importText(alphabet, data.text, data.qualifier);
  return envStore(state, data.name, value);
};

const reduceAddTool = function (state, data) {
  const id = 't' + state.nextToolId;
  return {
    ...state,
    nextToolId: state.nextToolId + 1,
    toolMap: {...state.toolMap,
      [id]: {
        type: data.type,
        title: 'TODO: remove and compute',
        settings: data.settings,
        state: data.state || {
          configuring: false
        }
      }
    },
    toolOrder: [...state.toolOrder, id]
  };
};

const reduceRemoveTool = function (state, id) {
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
  const toolMap = state.toolMap,
        tool = toolMap[id],
        toolState = tool.state,
        settings = tool.settings;
  return {
    ...state,
      toolMap: {...toolMap,
        [id]: {
          ...tool,
          state: {...toolState, ...data.state},
          settings: {...settings, ...data.settings}
      }
    }
  };
};

export default function reduce (state, action) {
  switch (action.type) {
    case '@@redux/INIT':
      return initialState();
    case 'DEFINE_ALPHABET':
      // name, symbols, pattern
      // TODO: check the alphabet
      return {
        ...state,
        alphabets: {...state.alphabets,
          [action.name]: {
            name: action.name,
            symbols: action.symbols,
            pattern: action.pattern
          }
        }
      }
    case 'IMPORT_TEXT':
      return reduceImportText(state, action.data);
    case 'IMPORT_SUBSTITUTION':
      var sourceAlphabet = state.alphabets[action.sourceAlphabet];
      var targetAlphabet = state.alphabets[action.targetAlphabet];
      let value = importSubstitution(sourceAlphabet, targetAlphabet, action.pairs);
      return envStore(state, action.name, value);
    case 'STORE':
      return envStore(state, action.name, action.value);
    case 'COMPUTE':
      // TODO: add a operations registry
      switch (action.operation) {
        case 'substitute':
          let text = envLookup(state, action.source);
          let substitution = envLookup(state, action.substitution);
          let value = applySubstitution(substitution, text);
          return envStore(state, action.destination, value);
      }
      console.log('dropped unknown COMPUTE action', action);
      return state;
    case 'ADD_TOOL':
      return reduceAddTool(state, action.data);
    case 'REMOVE_TOOL':
      return reduceRemoveTool(state, action.id);
    case 'UPDATE_TOOL':
      return reduceUpdateTool(state, action.id, action.data);
    default:
      console.log('dropped unknown action', action);
  }
  return state;
}
