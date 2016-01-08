
export const {getSubstitutionFromGridCells} = window.playFair;

export const makeAlphabet = function (chars) {
   const symbols = chars.split('');
   const size = symbols.length;
   var ranks = {};
   for (var iSymbol = 0; iSymbol < size; iSymbol++) {
      ranks[symbols[iSymbol]] = iSymbol;
   }
   const cellFromInput = function (symbol, locked) {
      if (symbol === undefined || symbol === '')
         return {q: 'unknown'};
      if (symbol in ranks) {
         const rank = ranks[symbol];
         return {l: rank, q: locked ? 'guess': 'locked'};
      }
   };
   return {chars, symbols, size, ranks};
};

const maxQualifier = {
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

/* Returns an array giving for each letter of the alphabet, the max qualifier for that letter in the grid */
export const getLetterQualifiersFromGrid = function (gridCells, alphabet) {
   const {size} = alphabet;
   const letterQualifiers = [];
   for (let iLetter = 0; iLetter < alphabet.size; iLetter++) {
      letterQualifiers[iLetter] = 'unknown';
   }
   const nbRows = gridCells.length;
   const nbCols = gridCells[0].length;
   for (let row = 0; row < nbRows; row++) {
      for (let col = 0; col < nbCols; col++) {
         const cell = gridCells[row][col];
         if (cell.q != 'unknown') {
            letterQualifiers[cell.l] = common.maxQualifier[letterQualifiers[cell.l]][cell.q];
         }
      }
   }
   return letterQualifiers;
};

export const at = function (index, func) {
   return function (array) {
      if (array === undefined) {
         const result = [];
         result[index] = func();
         return result;
      } else {
         const result = array.slice();
         result[index] = func(array[index]);
         return result;
      }
   };
};

export const put = function (value) {
   return function (_) {
      return value;
   };
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

export const getQualifierClass = function (q) {
   if ((q == "locked") || (q == "confirmed")) {
      return "qualifier-confirmed";
   } else if (q == "hint") {
      return "qualifier-hint";
   } else {
      return "qualifier-unconfirmed";
   }
};


/*
  Apply an editGrid to a grid.
  Elements of the grid are objects with properties 'letter' and 'locked'.
*/
export const applyGridEdit = function (alphabet, inputGrid, editGrid) {
   const nbRows = inputGrid.length;
   const nbCols = inputGrid[0].length;
   const resultRows = [];
   const letterRanks = alphabet.ranks;
   for (var row = 0; row < nbRows; row++) {
      const inputRow = inputGrid[row];
      const editRow = editGrid[row];
      let resultRow = inputRow;
      if (editRow !== undefined) {
         resultRow = [];
         for (var col = 0; col < nbCols; col++) {
            const inputCell = inputRow[col];
            const editCell = editRow[col];
            let resultCell = inputCell;
            if (inputCell.q !== 'confirmed' && inputCell.q !== 'hint' && editCell !== undefined) {
               const letterRank = letterRanks[editCell.letter];
               if (letterRank !== undefined) {
                  let qualifier = 'guess';
                  if (editCell.locked) {
                     qualifier = 'locked';
                  } else {
                     // If the input cell is locked, an identical 'guess' edit
                     // makes the output 'confirmed'.
                     if (inputCell.qualifier === 'locked' && letterRank == inputCell.l)
                        qualifier = 'confirmed';
                  }
                  resultCell = {l: letterRank, q: qualifier};
               }
            }
            resultRow.push(resultCell);
         }
      }
      resultRows.push(resultRow);
   }
   return resultRows;
};