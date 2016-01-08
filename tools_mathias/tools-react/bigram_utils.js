import {weakenCell} from './tools';

export const mostFrequentFrench = [
   { v: "ES", r: 3.1 },
   { v: "LE", r: 2.2 },
   { v: "DE", r: 2.2 },
   { v: "RE", r: 2.1 },
   { v: "EN", r: 2.1 },
   { v: "ON", r: 1.6 },
   { v: "NT", r: 1.6 },
   { v: "ER", r: 1.5 },
   { v: "TE", r: 1.5 },
   { v: "ET", r: 1.4 },
   { v: "EL", r: 1.4 },
   { v: "AN", r: 1.4 },
   { v: "SE", r: 1.3 },
   { v: "LA", r: 1.3 },
   { v: "AI", r: 1.2 },
   { v: "NE", r: 1.1 },
   { v: "OU", r: 1.1 },
   { v: "QU", r: 1.1 },
   { v: "ME", r: 1.1 },
   { v: "IT", r: 1.1 },
   { v: "IE", r: 1.1 },
   { v: "ED", r: 1.0 },
   { v: "EM", r: 1.0 },
   { v: "UR", r: 1.0 },
   { v: "IS", r: 1.0 },
   { v: "EC", r: 1.0 },
   { v: "UE", r: 0.9 },
   { v: "TI", r: 0.9 },
   { v: "RA", r: 0.9 },
   { v: "IN", r: 0.8 }
];

export const sideOfStatus = {'left': 0, 'right': 1};

export const decodeBigram = function (alphabet, bigram) {
   const {v} = bigram;
   return {...bigram,
      l0: alphabet.ranks[v.charAt(0)],
      l1: alphabet.ranks[v.charAt(1)]
   };
};

export const getTextAsBigrams = function (text, alphabet) {
   var textBigrams = [];
   var letterInfos = [];
   var curBigram = "", curRanks = [];
   var letterRanks = alphabet.ranks;
   var bigramStart = 0;

   function addBigram(bigram, start, end, iBigram) {
      textBigrams.push(bigram);
      for (var iLetter = start; iLetter < end; iLetter++) {
         letterInfos[iLetter].bigram = bigram;
         letterInfos[iLetter].iBigram = iBigram;
      }
   }

   var iLetter = 0;
   var iBigram = 0;
   while (iLetter < text.length) {
      const letter = text.charAt(iLetter);
      letterInfos.push({letter: letter});
      let status;
      const rank = letterRanks[letter];
      if (rank !== undefined) {
         curRanks[curBigram.length] = rank;
         curBigram += letter;
         if (curBigram.length == 2) {
            const bigram = {v: curBigram, l0: curRanks[0], l1: curRanks[1]};
            addBigram(bigram, bigramStart, iLetter + 1, iBigram);
            iBigram++;
            curBigram = "";
            status = "right";
         } else {
            status = "left";
            bigramStart = iLetter;
         }
      } else if (curBigram.length === 0) {
         status = "outside";
      } else {
         status = "inside";
      }
      letterInfos[iLetter].status = status;
      iLetter++;
   }
   if (curBigram.length === 1) {
      curBigram += letterRanks.X;
      addBigram(curBigram, bigramStart, iLetter + 1, iBigram);
   }
   return {
      bigrams: textBigrams,
      letterInfos: letterInfos
   };
};

export const getTextBigrams = function (text, alphabet) {
   var infos = getTextAsBigrams(text, alphabet);
   return infos.bigrams;
};

export const getMostFrequentBigrams = function (textBigrams) {
   const bigramMap = {};
   for (var iBigram = 0; iBigram < textBigrams.length; iBigram++) {
      const bigram = textBigrams[iBigram];
      const {v} = bigram;
      if (bigramMap[v] === undefined) {
         bigramMap[v] = {...bigram, count: 0};
      }
      bigramMap[v].count += 1;
   }
   const bigramList = Object.keys(bigramMap).map(v => bigramMap[v]);
   bigramList.sort(function(b1, b2) {
      if (b1.count > b2.count) {
         return -1;
      }
      if (b1.count < b2.count) {
         return 1;
      }
      return 0;
   });
   bigramList.length = 30;
   bigramList.map(function (bigram) {
      bigram.r = (bigram.count / textBigrams.length * 100).toFixed(1);
   });
   return bigramList;
};

export const getBigramSubstPair = function (substitution, bigram) {
   if (!substitution) return;
   const {l0, l1} = bigram;
   const sl0 = substitution[l0];
   if (sl0 !== undefined) {
      const substPair = sl0[l1];
      if (substPair !== undefined)
         return substPair;
   }
};

export const nullSubstPair = {
   dst: [{q: "unknown"}, {q: "unknown"}]
};

export const identitySubstPair = function (bigram) {
   return {
      src: [
         {l: bigram.l0, q: "confirmed"},
         {l: bigram.l1, q: "confirmed"}
      ],
      dst: [
         {q: "unknown"},
         {q: "unknown"}
      ]
   };
};

export const testSubstitutionConflict = function (substitution1, substitution2, bigram, side) {
   var substPair1 = getBigramSubstPair(substitution1, bigram) || nullSubstPair;
   var substPair2 = getBigramSubstPair(substitution2, bigram) || nullSubstPair;
   var q1 = substPair1.dst[side].q;
   var q2 = substPair2.dst[side].q;
   if (q1 === 'unknown' || q2 === 'unknown') {
      return false;
   }
   return substPair1.dst[side].l !== substPair2.dst[side].l;
};

export const countSubstitutionConflicts = function (bigrams, initialSubstitution, newSubstitution) {
   var nbConflicts = 0;
   for (var iBigram = 0; iBigram < bigrams.length; iBigram++) {
      var bigram = bigrams[iBigram];
      for (var side = 0; side < 2; side++) {
         if (testSubstitutionConflict(initialSubstitution, newSubstitution, bigram, side)) {
            nbConflicts++;
         }
      }
   }
   return nbConflicts;
};

export const countAllSubstitutionConflicts = function(initialSubstitution, newSubstitution, alphabet) {
   var bigrams = [];
   for (var l1 = 0; l1 < alphabet.size; l1++) {
      for (var l2 = 0; l2 < alphabet.size; l2++) {
         if (l1 != l2) {
            bigrams.push({
               v: alphabet.symbols[l1] + alphabet.symbols[l2]
            });
         }
      }
   }
   return countSubstitutionConflicts(bigrams, initialSubstitution, newSubstitution);
};


export const applySubstitutionEdits = function (alphabet, substitution, edits) {

   const editToCell = function (edit) {
      if (!edit)
         return {q: 'unknown'};
      return {l: alphabet.ranks[edit.letter], q: edit.locked ? 'locked' : 'guess'};
   };

   const editedSubstitution = [];
   alphabet.symbols.map(function (c1, l1) {
      alphabet.symbols.map(function (c2, l2) {
         const bigram = c1 + c2;
         if (bigram in edits) {
            const edit = edits[bigram];
            if (!(l1 in editedSubstitution))
               editedSubstitution[l1] = [];
            editedSubstitution[l1][l2] = {
               src: [
                  {l: l1},
                  {l: l2}
               ],
               dst: [
                  editToCell(edit[0]),
                  editToCell(edit[1])
               ]
            };
         }
      });
   });

   const cloneSubstitutionPairOrCreate = function (substitution, rank1, rank2) {
      // TODO: src might be needed in the future
      if ((substitution[rank1] != undefined) && (substitution[rank1][rank2] != undefined)) {
         var substPair = substitution[rank1][rank2];
         return {
            src: [
               {l: substPair.src[0].l, q: substPair.src[0].q},
               {l: substPair.src[1].l, q: substPair.src[1].q}
            ],
            dst: [
               {l: substPair.dst[0].l, q: substPair.dst[0].q},
               {l: substPair.dst[1].l, q: substPair.dst[1].q}
            ]
         };
      }
      else {
         return {
            src: [
               {l: rank1, q: "confirmed"},
               {l: rank2, q: "confirmed"}
            ],
            dst: [
               {q: "unknown"},
               {q:"unknown"}
            ]
         };
      }
   };
   const updateCell = function (inputCell, editedCell, outputCell) {
      if (editedCell.q == 'unknown') {
         outputCell.l = inputCell.l;
         if (inputCell.q == 'locked') {
            outputCell.q = 'confirmed';
         } else {
            outputCell.q = inputCell.q;
         }
      } else {
         outputCell.l = editedCell.l;
         outputCell.q = editedCell.q;
      }
   };

   const inputSubstitution = substitution;
   const outputSubstitution = [];
   for (let l1 = 0; l1 < alphabet.size; l1++) {
      for (let l2 = 0; l2 < alphabet.size; l2++) {
         const inputSubstPair = cloneSubstitutionPairOrCreate(inputSubstitution, l1, l2);
         const editedSubstPair = cloneSubstitutionPairOrCreate(editedSubstitution, l1, l2);
         const outputSubstPair = cloneSubstitutionPairOrCreate(outputSubstitution, l1, l2);
         let updated = false;
         for (let side = 0; side < 2; side++) {
            if ((inputSubstPair.dst[side].q !== "unknown") || (editedSubstPair.dst[side].q !== "unknown")) {
               updated = true;
               updateCell(inputSubstPair.dst[side], editedSubstPair.dst[side], outputSubstPair.dst[side]);
            }
         }
         if (updated) {
            if (outputSubstitution[l1] === undefined) {
               outputSubstitution[l1] = [];
            }
            outputSubstitution[l1][l2] = outputSubstPair;
         }
      }
   }

   return outputSubstitution;
};

export const applySubstitution = function (alphabet, substitution, letterInfos) {
   const outputText = [];
   for (var iLetter = 0; iLetter < letterInfos.length; iLetter++) {
      const letterInfo = letterInfos[iLetter];
      const {status} = letterInfo;
      const side = sideOfStatus[status];
      let cell;
      if (side === undefined) {
         cell = {c: letterInfo.letter};
      } else {
         const bigram = letterInfo.bigram;
         const substPair = getBigramSubstPair(substitution, bigram) || nullSubstPair;
         cell = weakenCell(substPair.dst[side]);
      }
      outputText.push(cell);
   }
   return outputText;
};
