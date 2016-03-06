import React from 'react';
import classnames from 'classnames';
import flatten from 'flatten';

export const c = function (name) {
   return 'y15r4-' + name;
};

export const makeAlphabet = function (symbols) {
   const size = symbols.length;
   var ranks = {};
   for (var iSymbol = 0; iSymbol < size; iSymbol++) {
      ranks[symbols[iSymbol]] = iSymbol;
   }
   return {symbols, size, ranks};
};

export const cipherAlphabet = makeAlphabet(
   flatten([
      '123456789'.split('').map(right => '0'+right),
      '1234567'.split('').map(left => '0123456789'.split('').map(right => left + right)),
      '80'
   ]));
export const clearAlphabet = makeAlphabet([
   ' ', '!', '$', '%', '&', "'", '(', ')', '+', ',', '-', '.', '/',
   '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
   ':', ';', '=', '?', '@',
   'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
   'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
   'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
]);

export const cellsFromString = function (text, alphabet) {
   const cells = [];
   let bigram = false;
   let line = 1, column = 1;
   for (let iLetter = 0; iLetter < text.length; iLetter++) {
      const letter = text.charAt(iLetter);
      if (/[0-9]/.test(letter)) {
         if (!bigram) {
            bigram = {symbol: letter, line, column};
         } else {
            bigram.symbol = bigram.symbol + letter;
            bigram.rank = alphabet.ranks[bigram.symbol];
            cells.push(bigram);
            bigram = false;
         }
      } else {
         if (letter === '\n') {
            line += 1;
            column = 0;
         }
         cells.push({symbol: letter, line, column});
      }
      column += 1;
   }
   return cells;
};

export const getFrequencies = function (text) {
   const {alphabet, cells} = text;
   const symbolMap = alphabet.symbols.map(function (symbol, rank) {
      return {rank, symbol, count: 0};
   });
   let bigramCount = 0;
   for (let iCell = 0; iCell < cells.length; iCell++) {
      const cell = cells[iCell];
      if (cell.rank !== undefined) {
         symbolMap[cell.rank].count += 1
         bigramCount += 1;
      }
   }
   symbolMap.forEach(function (s, i) {
      s.proba = s.count / bigramCount;
   });
   symbolMap.sort(function(s1, s2) {
      const c1 = s1.count, c2 = s2.count;
      return c1 > c2 ? -1 : (c1 < c2 ? 1 : 0);
   });
   return symbolMap;
};

export const buildSubstitution = function (editedPairs, inputText, targetAlphabet, bigramFrequencies, referenceFrequencies) {
   const sourceAlphabet = inputText.alphabet;
   const mapping = [];
   const reverseMapping = [];
   const letterRankUsed = Array(targetAlphabet.size);
   const addMapping = function (bigramRank, letterRank, qualifier) {
      const letter = targetAlphabet.symbols[letterRank];
      mapping[bigramRank] = {rank: letterRank, symbol: letter, qualifier};
      reverseMapping[letterRank] = bigramRank;
      letterRankUsed[letterRank] = true;
   };

   // Initialize the mapping using editedPairs.
   Object.keys(editedPairs).forEach(function (bigram) {
      const bigramRank = sourceAlphabet.ranks[bigram];
      const {letter, edited} = editedPairs[bigram];
      const letterRank = targetAlphabet.ranks[letter];
      addMapping(bigramRank, letterRank, edited ? 'edited' : 'swapped');
   });

   // Pair (unused) bigrams with (unused) referenceFrequencies items,
   // in order of decreasing frequency.
   let nextRefIndex = 0;
   bigramFrequencies.forEach(function (bigramStats) {
      const bigramRank = bigramStats.rank;
      if (mapping[bigramRank])
         return;
      while (nextRefIndex < referenceFrequencies.length) {
         const letterStats = referenceFrequencies[nextRefIndex];
         const letter = letterStats.symbol;
         const letterRank = targetAlphabet.ranks[letter];
         nextRefIndex += 1;
         if (!letterRankUsed[letterRank]) {
            addMapping(bigramRank, letterRank, 'suggested');
            return;
         }
      }
   });

   // Pair (unused) bigrams with (unused) letters by rank.
   const letters = targetAlphabet.symbols;
   let nextLetterRank = 0;
   sourceAlphabet.symbols.forEach(function (bigram, bigramRank) {
      if (mapping[bigramRank])
         return;
      while (nextLetterRank < letters.length) {
         const letterRank = nextLetterRank;
         nextLetterRank += 1;
         if (!letterRankUsed[letterRank]) {
            addMapping(bigramRank, letterRank, 'filler');
            return;
         }
      }
   });

   return {sourceAlphabet, targetAlphabet, mapping, reverseMapping};
};
