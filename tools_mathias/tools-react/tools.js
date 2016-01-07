
export const {getLetterQualifiersFromGrid} = window.common;
export const {getSubstitutionFromGridCells} = window.playFair;

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
      return alphabet[cell.l];
   }
};

export const getLetterRank = function (alphabet, letter) {
   for (var iLetter = 0; iLetter < alphabet.length; iLetter++) {
      if (alphabet[iLetter] === letter)
         return iLetter;
   }
};

export const getLetterRanks = function (alphabet) {
   var letterRanks = {};
   for (var iLetter = 0; iLetter < alphabet.length; iLetter++) {
      letterRanks[alphabet[iLetter]] = iLetter;
   }
   return letterRanks;
};

/*
  Apply an editGrid to a grid.
  Elements of the grid are objects with properties 'letter' and 'locked'.
*/
export const applyGridEdit = function (alphabet, inputGrid, editGrid) {
   // XXX get alphabet from inputGrid
   const nbRows = inputGrid.length;
   const nbCols = inputGrid[0].length;
   const resultRows = [];
   const letterRanks = getLetterRanks(alphabet);  // XXX make alphabet an object
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
