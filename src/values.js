
import range from 'node-range';
import Shuffle from 'shuffle';

export function combineQualifiers (q1, q2) {
  if (q1 === 'given')
    return q2;
  if (q2 === 'given')
    return q1;
  console.log('COMBINE QUALIFIERS', q1, q2);
  return 'complex';
}

export function errorValue (message) {
  return {type: 'error', message};
}

export function importText (alphabet, string, qualifier) {
  const items = [];
  const value = {
    type: 'text',
    alphabet: alphabet,
    source: string,
    items: items
  };
  const regexp = new RegExp(alphabet.pattern, 'g');
  let lastIndex = -1;
  while (lastIndex < regexp.lastIndex) {
    lastIndex = regexp.lastIndex;
    const match = regexp.exec(string);
    if (match === null)
      break;
    const startIndex = regexp.lastIndex - match[0].length;
    if (startIndex > lastIndex) {
      // Add literal characters.
      string.slice(lastIndex, startIndex).split('').forEach(function (c) {
        items.push({c: c});
      });
    }
    // Add recognized symbol.
    const index = alphabet.symbols.indexOf(match[0]);
    items.push({i: index, q: qualifier});
  }
  // Add trailing literal characters.
  if (lastIndex < string.length) {
    string.slice(lastIndex).split('').forEach(function (c) {
        items.push({c: c});
      });
  }
  return value;
}

export function editText (value, edit) {
  const {insert, remove, position} = edit;
  // TODO check value.aplhabet === insert.alphabet
  // Copy and update the array.
  const items = value.items.slice();
  Array.prototype.splice.apply(items, [position, remove, ...insert.items]);
  return {...value, items};
}

export const importSubstitution = function (input) {
  const {sourceAlphabet, targetAlphabet, pairs} = input;
  // Sanity checks.
  if (typeof sourceAlphabet === 'undefined')
    return {'error': 'invalid source alphabet'};
  if (typeof targetAlphabet === 'undefined')
    return {'error': 'invalid target alphabet'};
  // Build an array from which we'll remove used indexes in the target
  // alphabet, and which we'll then use to fill in undefined mappings.
  const targetRange = range(0, targetAlphabet.symbols.length).toArray();
  // Build a mapping from source symbol to target index, ignoring pairs
  // that have no index in the target alphabet.
  const mapping = {};
  pairs && Object.keys(pairs).forEach(function (c) {
    const p = pairs[c];
    const targetIndex = targetAlphabet.symbols.indexOf(p.c);
    if (targetIndex !== -1) {
      // Remove targetIndex from targetRange to avoid using this symbol as
      // a filler.
      const i = targetRange.indexOf(targetIndex);
      if (i !== -1)
        targetRange.splice(i, 1);
      mapping[c] = {i: targetIndex, l: p.l};
    }
  });
  // Build the index map (array keyed by source index).
  const indexMap = targetAlphabet.symbols.map(function (c) {
    if (c in mapping)
      return mapping[c];
    // Fill up the substitution using the next index from targetRange.
    return {i: targetRange.shift(), l: false};
  });
  return {
    type: 'substitution', sourceAlphabet, targetAlphabet, indexMap
  };
};

function getIdentityMapping (alphabet) {
  const mapping = {};
  alphabet.symbols.forEach(function (c) {
    mapping[c] = {c: c, l: false};
  });
  return mapping;
}

function getShuffleMapping (alphabet) {
  const mapping = {};
  const shuffle = Shuffle.shuffle({deck: alphabet.symbols}).cards;
  shuffle.forEach(function (c, i) {
    mapping[alphabet.symbols[i]] = {c: c, l: false};
  });
  return mapping;
}

export function runSubstitutionInitializer (initializer, alphabet) {
  if (alphabet === undefined) {
    console.log('warning: cannot initialize substitution');
    return;
  }
  switch (initializer.type) {
  case 'identity':
    return getIdentityMapping(alphabet);
  case 'shuffle':
    return getShuffleMapping(alphabet);
  // TODO: ROT, ...
  default:
    return {};
  }
}

export function applySubstitution (substitution, text) {
  if (substitution.sourceAlphabet !== text.alphabet)
    return errorValue('alphabet mismatch');
  const {indexMap} = substitution;
  const items = text.items.map(function (item) {
    // Pass literal characters unchanged.
    if ('c' in item) return item;
    // Apply the substitution to symbols of the alphabet.
    let p = indexMap[item.i];
    return {i: p.i, q: p.l ? 'locked' : item.q};
  });
  return {
    type: 'text',
    alphabet: substitution.targetAlphabet,
    items: items
  };
}
