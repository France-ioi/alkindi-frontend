
import {importText, importSubstitution, errorValue} from './values';

export function initialState () {
  return {
    score: 300,
    maxScore: 300,
    alphabets: {},
    environment: {},
    controls: [],
    toolOrder: ['tool1', 'tool2'],
    toolMap: {
      'tool1': {
        type: 'TextDisplay',
        title: 'Texte en clair',
        settings: {
          input: 'cleartext'
        }
      },
      'tool2': {
        type: 'TextDisplay',
        title: 'Texte chiffré',
        settings: {
          input: 'ciphertext'
        }
      }
    }
  };
}

function envLookup (state, name) {
  return state.environment[name];
}

function envStore (state, name, value) {
  // TODO: check value validity
  return {
    ...state,
    environment: {...state.environment,
      [name]: value
    }
  };
}

function combineQualifiers (q1, q2) {
  if (q1 === 'given')
    return q2;
  if (q2 === 'given')
    return q1;
  console.log('COMBINE QUALIFIERS', q1, q2);
  return 'complex';
}

function applySubstitution (substitution, text) {
  if (substitution.sourceAlphabet !== text.alphabet)
    return errorValue('alphabet mismatch');
  let pairs = substitution.pairs;
  let iqArray = text.iqArray.map(function (iq) {
    let p = pairs[iq.i];
    return {i: p.i, q: combineQualifiers(iq.q, p.q)};
  });
  return {
    type: 'text',
    alphabet: substitution.targetAlphabet,
    iqArray: iqArray,
    inserts: text.inserts
  };
}

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
      var alphabet = state.alphabets[action.alphabet];
      var value = importText(alphabet, action.text, action.qualifier);
      return envStore(state, action.name, value);
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
    case 'CONFIGURE_TOOL':
      return {
        ...state,
        toolMap: {...state.toolMap,
          [action.id]: {
            ...state.toolMap[action.id],
            settings: action.settings
          }
        }
      };
    default:
      console.log('dropped unknown action', action);
  }
  return state;
}
