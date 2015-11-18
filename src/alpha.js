
export function toIndex (c) {
  var i = c.charCodeAt(0) - 97;
  return (i >= 0 && i <= 25) ? i : -1;
}

export function toIndices (str) {
  return str.split('').map(toIndex);
}

export function toChar (i) {
  return String.fromCharCode(97 + i);
}

export function toChars (is) {
  return is.map(toChar).join('');
}
