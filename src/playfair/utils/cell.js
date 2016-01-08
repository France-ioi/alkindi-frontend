
// Cells in the alphabet always have a qualifier (cell.q) (which could be
// 'unknown', in which case cell.l is absent).
// Literals never have a qualifier, e.g. {c: ' '}.

export const makeAlphabet = function (chars) {
   const symbols = chars.split('');
   const size = symbols.length;
   var ranks = {};
   for (var iSymbol = 0; iSymbol < size; iSymbol++) {
      ranks[symbols[iSymbol]] = iSymbol;
   }
   const cellFromInput = function (symbol, locked) {
      // This function is not made available, but could be useful to
      // export in alphabet.
      if (symbol === undefined || symbol === '')
         return {q: 'unknown'};
      if (symbol in ranks) {
         const rank = ranks[symbol];
         return {l: rank, q: locked ? 'guess': 'locked'};
      }
      return {c: symbol};
   };
   return {chars, symbols, size, ranks};
};

export const maxQualifier = {
   'unknown': {
      'unknown': 'unknown',
      'guess': 'guess',
      'locked': 'locked',
      'confirmed': 'confirmed',
      'hint': 'hint'
   },
   'guess': {
      'unknown': 'guess',
      'guess': 'guess',
      'locked': 'locked',
      'confirmed': 'confirmed',
      'hint': 'hint'
   },
   'locked': {
      'unknown': 'locked',
      'guess': 'locked',
      'locked': 'locked',
      'confirmed': 'confirmed',
      'hint': 'hint'
   },
   'confirmed': {
      'unknown': 'confirmed',
      'guess': 'confirmed',
      'locked': 'confirmed',
      'confirmed': 'confirmed',
      'hint': 'hint'
   },
   'hint': {
      'unknown': 'hint',
      'guess': 'hint',
      'locked': 'hint',
      'confirmed': 'hint',
      'hint': 'hint'
   }
};

export const testConflict = function (cell1, cell2) {
   return cell1.q !== 'unknown' && cell2.q !== 'unknown' && cell1.l !== cell2.l;
};

export const weakenCell = function (cell) {
   if (cell.q === 'locked')
      return {...cell, q: 'confirmed'};
   return cell;
};

export const getCellLetter = function (alphabet, cell, useNbsp) {
   if (cell.q === 'unknown') {
      if (useNbsp) {
         return '\u00a0';
      } else {
         return '';
      }
   } else {
      return alphabet.symbols[cell.l];
   }
};

const qualifierClasses = {
   'hint': 'qualifier-hint',
   'confirmed': 'qualifier-confirmed',
   'locked': 'qualifier-confirmed',
   'guess': 'qualifier-unconfirmed',
   'unknown': 'qualifier-unconfirmed'
};

export const getQualifierClass = function (q) {
   if (q === undefined)
      return 'character'; // literal
   return qualifierClasses[q];
};
