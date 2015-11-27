
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

export function importSubstitution (sourceAlphabet, targetAlphabet, pairs) {
  // TODO: check pairs
  return {
    type: 'substitution', sourceAlphabet, targetAlphabet, pairs
  };
}

export function applySubstitution (substitution, text) {
  if (substitution.sourceAlphabet !== text.alphabet)
    return errorValue('alphabet mismatch');
  let pairs = substitution.pairs;
  let items = text.items.map(function (item) {
    // Pass literal characters unchanged.
    if ('c' in item) return item;
    // Apply the substitution to symbols of the alphabet.
    let p = pairs[item.i];
    return {i: p.i, q: combineQualifiers(item.q, p.q)};
  });
  return {
    type: 'text',
    alphabet: substitution.targetAlphabet,
    items: items
  };
}
