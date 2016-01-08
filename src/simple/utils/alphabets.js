import range from 'node-range';
import flatten from 'arr-flatten';

function charRange (c1, c2) {
  const baseCode = c1.charCodeAt(0);
  const count = c2.charCodeAt(0) - baseCode + 1;
  return range(0, count).map(function (i) { return String.fromCharCode(baseCode + i); });
}

export const letters = {
  name: 'letters',
  symbols: charRange('A', 'Z'),
  pattern: '[A-Z]'
};

export const letters_and_digits = {
  name: 'letters and digits',
  symbols: flatten([charRange('A', 'Z'), charRange('0', '9')]),
  pattern: '[A-Z0-9]'
};

export default {
  letters,
  letters_and_digits
};
