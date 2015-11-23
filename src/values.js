
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
    value.iqArray.push({i: index, q: qualifier});
  }
  return value;
}

export function importSubstitution (sourceAlphabet, targetAlphabet, pairs) {
  // TODO: check pairs
  return {
    type: 'substitution', sourceAlphabet, targetAlphabet, pairs
  };
}
