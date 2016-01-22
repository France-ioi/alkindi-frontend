import React from 'react';
import classnames from 'classnames';
import flatten from 'flatten';

///////////////////////////////////////////////////////////////////////
//
// Rendering
//

const qualifierClasses = {
    'hint': 'qualifier-hint',
    'confirmed': 'qualifier-confirmed',
    'locked': 'qualifier-confirmed',
    'guess': 'qualifier-confirmed',
    'unknown': 'qualifier-unconfirmed'
};

export const getQualifierClass = function(qualifier) {
   return qualifierClasses[qualifier];
};

export const renderCell = function (key, cell, alphabet) {
   const c0 = alphabet.symbols[cell.l];
   const q0 = classnames(['adfgx-cell', getQualifierClass(cell.q)]);
   return <span key={key} className={q0}>{c0}</span>;
};

export const renderBigram = function (key, bigram, alphabet) {
   return (
      <span key={key} className="adfgx-bigram">
         {renderCell(0, bigram.c0, alphabet)}
         {renderCell(1, bigram.c1, alphabet)}
      </span>
   );
};

export const cellsFromString = function (text, alphabet) {
    const cells = [];
    for (let iLetter = 0; iLetter < text.length; iLetter++) {
         const letter = text.charAt(iLetter);
         const rank = alphabet.ranks[letter];
         if (rank !== undefined)
             cells.push({l: rank})
    }
    return cells;
};

export const renderText = function (text) {
   const {alphabet, cells} = text;
   const lines = [];
   let line = [];
   cells.forEach(function (cell, iCell) {
      line.push(renderCell(iCell, cell, alphabet));
      if (line.length === 40) {
         lines.push(<div key={lines.length} className="adfgx-line">{line}</div>);
         line = [];
      }
   });
   if (line.length > 0)
      lines.push(<div key={lines.length}>{line}</div>)
   return <div className='adfgx-text'>{lines}</div>;
};

///////////////////////////////////////////////////////////////////////
//
// Alphabets
//

export const makeAlphabet = function (symbols) {
   const size = symbols.length;
   var ranks = {};
   for (var iSymbol = 0; iSymbol < size; iSymbol++) {
      ranks[symbols[iSymbol]] = iSymbol;
   }
   return {symbols, size, ranks};
};

export const makeBigramAlphabet = function (symbols) {
   return makeAlphabet(flatten(symbols.map(c1 => symbols.map(c2 => c1 + c2))));
};

export const clearAlphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ'.split(''));
export const adfgxAlphabet = makeAlphabet('ADFGX'.split(''));
export const bigramAlphabet = makeBigramAlphabet('ADFGX'.split(''));

///////////////////////////////////////////////////////////////////////
//
// Conversion
//

export const bigramsFromCells = function (cells, cellAlphabet) {
    const bigrams = [];
    let first = true;
    let c0;
    cells.forEach(function (c1) {
         if (first) {
             c0 = c1;
         } else {
             const l = c0.l * cellAlphabet.size + c1.l;
             const v = cellAlphabet.symbols[c0.l] + cellAlphabet.symbols[c1.l];
             bigrams.push({l, v, c0, c1});
         }
         first = !first;
    });
    return bigrams;
};

///////////////////////////////////////////////////////////////////////
//
// Analysis
//

export const coincidenceIndex = function(text) {
   const {cells, alphabet} = text;
   const occurrences = Array(alphabet.size).fill(0);
   cells.forEach(function (cell) {
      if ('l' in cell)
         occurrences[cell.l] += 1;
   });
   let coincidence = 0;
   const nbLetters = cells.length;
   for (let iLetter = 0; iLetter < alphabet.size; iLetter++) {
      const proba = occurrences[iLetter] * (occurrences[iLetter] - 1) / (nbLetters * (nbLetters - 1));
      coincidence += proba;
   }
   return coincidence;
};

export const getFrequencies = function (text) {
   const {alphabet, cells} = text;
   const symbolMap = Array(alphabet.size);
   for (let iSymbol = 0; iSymbol < alphabet.size; iSymbol++) {
      symbolMap[iSymbol] = {l: iSymbol, count: 0};
   }
   for (let iCell = 0; iCell < cells.length; iCell++) {
      const cell = cells[iCell];
      if (cell.l !== undefined)
         symbolMap[cell.l].count += 1
   }
   symbolMap.forEach(function (s, i) {
      s.p = s.count / cells.length;
      s.r = (s.p * 100).toFixed(1);
   });
   symbolMap.sort(function(s1, s2) {
      const c1 = s1.count, c2 = s2.count;
      return c1 > c2 ? -1 : (c1 < c2 ? 1 : 0);
   });
   return symbolMap;
};

///////////////////////////////////////////////////////////////////////
//
// Permutation
//

export const numbersAlphabet = makeAlphabet('0123456789');

export const permutationFromString = function (str, alphabet) {
   return cellsFromString(str, alphabet || numbersAlphabet);
};

export const permutationToString = function (permutation, alphabet) {
   cellsToString(permutation, alphabet || numbersAlphabet)
};

/**
 * Apply a permutation-with-qualifiers to an array of cells.
 */
export const applyPermutation = function (text, permutation) {
   const {cells} = text;
   const stride = permutation.length;
   const srcLength = cells.length;
   let dstLength = srcLength;
   if (srcLength % stride !== 0) {
      dstLength += stride - (srcLength % stride);
   }
   const nbRows = dstLength / stride;
   const dstCells = new Array(dstLength);
   for (let srcPos = 0; srcPos < dstLength; srcPos++) {
      const row = srcPos % nbRows;
      const col = (srcPos - row) / nbRows;
      let dstCell;
      if (srcPos < srcLength) {
         dstCell = {l: cells[srcPos].l, q: permutation[col].q};
      } else {
         dstCell = {};
      }
      const dstPos = row * stride + permutation[col].dstPos;
      dstCells[dstPos] = dstCell;
   }
   return dstCells;
};

/**
 * Take as input a permutation-with-qualifiers, and output an array of
 * permutations-with-qualifiers.
 */
export const generatePermutations = function (partialPermutation, alphabet) {
   const stride = partialPermutation.length;
   // Find the available values, and fill the know positions in curPermutation.
   const valuesAvailable = Array(stride).fill(true);
   const curPermutation = Array(stride);
   for (let iPos = 0; iPos < stride; iPos++) {
      if (partialPermutation[iPos].q !== "unknown") {
         valuesAvailable[iPos] = false;
         curPermutation[iPos] = partialPermutation[iPos];
      }
   }
   const permutations = [];
   const recFillPermutations = function (iPos, key) {
      if (iPos === stride) {
         // Base case, accumulate the permutation.
         // The copy is necessary as curPermutation is mutated throughout the recursion.
         permutations.push({
            key: key,
            qualified: curPermutation.slice()
         });
         return;
      }
      if (partialPermutation[iPos].q !== "unknown") {
         // Case where the current position is fixed, simply recurse.
         recFillPermutations(iPos + 1, key + alphabet.symbols[curPermutation[iPos].dstPos]);
         return;
      }
      // Enumerate available values for the current position, and recurse.
      for (let value = 0; value < valuesAvailable.length; value++) {
         if (valuesAvailable[value]) {
            curPermutation[iPos] = {dstPos: value, q: 'guess'};
            valuesAvailable[value] = false;
            recFillPermutations(iPos + 1, key + alphabet.symbols[value]);
            valuesAvailable[value] = true;
         }
      }
   };
   recFillPermutations(0, '');
   return permutations;
};

// Compare two permutations-without-qualifiers.
export const comparePermutations = function (p1, p2) {
   for (let iPos = 0; iPos < p1.length; iPos++) {
      if (p1[iPos] < p2[iPos])
         return -1;
      if (p1[iPos] > p2[iPos])
         return 1;
   }
   return p1.length < p2.length ? -1 : 0;
};

///////////////////////////////////////////////////////////////////////
//
// Substitution
//

export const applySubstitutionToText = function (substitution, text) {
   const {cells} = text;
   const {mapping, targetAlphabet} = substitution;
   const outputCells = [];
   for (let iCell = 0; iCell < cells.length; iCell++) {
      const inputCell = cells[iCell];
      const outputCell = weakenCell(mapping[inputCell.l]);
      outputCells.push(outputCell);
   }
   return {alphabet: targetAlphabet, cells: outputCells};
};
