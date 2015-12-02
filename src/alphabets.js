import range from 'node-range';

export const letters = {
  name: 'letters',
  symbols: range(0, 26).map(function (i) { return String.fromCharCode(65 + i); }),
  pattern: '[A-Z]'
};
