
export function toIndex (c) {
  var i = c.charCodeAt(0) - 97;
  return (i >= 0 && i <= 25) ? i : c;
}

export function toIndices (str) {
  return str.split('').map(toIndex);
}

export function toChar (i) {
  if (typeof i === 'string')
    return i;
  return String.fromCharCode(97 + i);
}

export function toString (indices) {
  return indices.map(toChar).join('');
}

export function substIndex (s, i) {
  if (typeof i === 'string')
    return i;
  return s[i];
}

export function substString (sub, str) {
  return toString(toIndices(str).map(function (i) { return substIndex(sub, i); }));
}

export function inverse (s) {
  var r = Array.apply(null, {length: 26});
  r.forEach(function (_, i) { r[s[i]] = i; });
  return r;
}
