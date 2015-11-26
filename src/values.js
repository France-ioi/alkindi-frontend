
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
  let value = {
    type: 'text',
    alphabet: alphabet,
    source: string,
    iqArray: [],
    inserts: []
  };
  let regexp = new RegExp(alphabet.pattern, 'g');
  let lastIndex = -1;
  while (lastIndex < regexp.lastIndex) {
    lastIndex = regexp.lastIndex;
    let match = regexp.exec(string);
    if (match === null)
      break;
    let startIndex = regexp.lastIndex - match[0].length;
    if (startIndex > lastIndex) {
      value.inserts.push([
        value.iqArray.length,
        string.slice(lastIndex, startIndex)
      ]);
    }
    let index = alphabet.symbols.indexOf(match[0]);
    value.iqArray.push({i: index, q: qualifier, s: 'TODO SOURCE'});
  }
  return value;
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
