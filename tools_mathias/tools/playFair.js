var playFair = {
   alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'],

   emptyGrid: [
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
   ],

   initialTaskGrid: [
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {l:11, q:'confirmed'}, {q:'unknown'}, {q:'unknown'}, {l:10, q:'confirmed'}],
      [{q:'unknown'}, {l:16, q:'confirmed'}, {q:'unknown'}, {q:'unknown'}, {l: 4, q:'confirmed'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
   ],

   sampleGrid: [
      [{q:'unknown'}, {l:10, q:'locked'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {l:0, q:'locked'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {l:7, q:'confirmed'}, {q:'unknown'}, {l:4, q:'confirmed'}, {q:'unknown'}],
      [{l:9, q:'confirmed'}, {l:20, q:'confirmed'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
   ],

   sampleGrid2: [
      [{q:'unknown'}, {l:10, q:'locked'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {l:0, q:'locked'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {l:11, q:'confirmed'}, {q:'unknown'}, {l:4, q:'confirmed'}, {q:'unknown'}],
      [{l:9, q:'confirmed'}, {l:20, q:'confirmed'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
   ],

   sampleCipheredText: "KQ CVG XSVR ACHZ JDSKQ CBAVHM, AKV TKMV QKAONPXTP, OD CSACQ MT ZTAZQ BONP NI MQUGQTN. BSPV QKAIHVACBQZ, PTSC PCDSVCQZTPL ICKLNADVC PVQ MCK TIEUTQQTYV KCQVTQCK MQ OD YLIVTQFZ. QKKQ KC QNSPZC IDVO PV HTCAF PDNMQ ZMGUKQ. NSSC KQ QNSPZCZQN MP CZQPAT FAVT DZCVPT MPASAZT NLYVCVPXLS. NSSC O FNLSUQZMH HQIPTSGB MQ ALISZMPAO I NSSC MQ TJDVQ KT QVD. OTBV O JFVFTMQV DS RSPY CIPQ OT ZHIQZL AG UYN TQ OD TSDHAVDJYLR AS IDITZIO. TSJZZM FT AKMQ MQ EUJCQXMZTZA P'CKA OIO TJAC OTBV KQO VKALBCK, MF KQO IM CQVACC IJ-ICKYLSC, TZ KQC IUMJGQXNPQ A'PVT MPCZQ ADVAQZT. FT FLAT ZQ MSAQ TP NSIPV TIK CQNFZ TFVDA TB IVUBSHGT M PV CAQZYV. CSVUMH OD BNSTQMBVC KSVNIPAT : FTPZCNQVCKCR KCK KQFNQNCK MQ NSQNT HZQPTA DZCT I TJAC PV, G QDJQ ACHZ, FQF TQ IHOQAUSDMH KQO CSPQTY. CDJQTY ST HNLIBAC IB PTDHZQ LPQTVP TQ MQ UVXPA-PCHE TQ NTQNDVTKMR MJV-ZTGC. KQ ZQCSOQNA LPQTVP KCND NSQNT FKQ. OTBV SLTISDKCB QQ HYN, BNTZRBQ KF HNDRA PTDHZQ IV MQYVYLSC TQ K YSPOCNDDVT CPIQNC-ZAVPF-CBAVHM. KQ ZQCSOQNA LPQTVP ALAC TQZQ IJUVKC ONV XTAZQ QST. FQKD ITPZT IVRT EUJCQXCK, KQL ICHN GZQAJQZY CLNZMPA KQ VPZMNL MQ PLR, YCK IPQNCK KQ TSMQ IB TIMQPNYV. \n254292628",
   sampleHints: [
      ['P', 'B', 'U', 'G', 'H'],
      ['O', 'L', 'S', 'Y', 'K'],
      ['T', 'Q', 'C', 'F', 'E'],
      ['A', 'D', 'I', 'J', 'M'],
      ['N', 'R', 'V', 'X', 'Z']
   ],

   getHintGrid: function(hints, row, col) {
      var letterRanks = common.getLetterRanks(this.alphabet);
      var letter = hints[row][col];
      return letterRanks[letter];
   },

   getHintAlphabet: function(hints, rank) {
      var letterRanks = common.getLetterRanks(this.alphabet);
      for (var row = 0; row < hints.length; row++) {
         for (var col = 0; col < hints[row].length; col++) {
            var curRank = letterRanks[hints[row][col]];
            if (rank == curRank) {
               return {row: row, col: col};
            }
         }
      }
      return null;
   },

   getSampleSubstitution: function() {
      return this.getSubstitutionFromGridCells(this.sampleGrid);
   },
   
   getSampleSubstitutionWithConflict: function() {
      return this.getSubstitutionFromGridCells(this.sampleGrid2);
   },

   updateCells: function(inputCells, outputCells) {
      var nbRows = inputCells.length;
      var nbCols = inputCells[0].length;
      for (var row = 0; row < nbRows; row++) {
         if (outputCells[row] == undefined) {
            outputCells[row] = [];
         }
         for (var col = 0; col < nbCols; col++) {
            if (outputCells[row][col] == undefined) {
               outputCells[row][col] = { q: 'unknown'};
            }
            common.updateCell(inputCells[row][col], outputCells[row][col]);
         }
      }
   },
   
   renderGrid: function(toolName, cells, selectedRow, selectedCol, isConflictFct) {
      var strHtml = "<table class='playFairGrid'>";
      var nbRows = cells.length;
      var nbCols = cells[0].length;
      for (var row = 0; row < nbRows; row++) {
         strHtml += "<tr>";
         for (var col = 0; col < nbCols; col++) {
            var cell = cells[row][col];
            var queryClass = "";
            if ((selectedRow === row) && (selectedCol === col)) {
               queryClass = "cell-query";
            }
            var cellClass = "";
            if ((isConflictFct != undefined) && (isConflictFct(row, col))) {
               cellClass += " cell-conflict";
            }
            strHtml += "<td class='" + queryClass + cellClass + " " + "qualifier-" + cell.q + "' onClick='" + toolName + ".clickGridCell(" + row + "," + col + ")'>" +
                  common.getCellLetter(this.alphabet, cell, true) +
            "</td>";
         }
         strHtml += "</tr>";
      }
      strHtml += "</table>";
      return strHtml;
   },

   getDstCoords: function(row1, col1, row2, col2) {
      if ((row1 != row2) && (col1 != col2)) {
         return [
            {row: row1, col: col2},
            {row: row2, col: col1}
         ];
      } else if (row1 == row2) {
         return [
            {row: row1, col: (col1 + 4) % 5},
            {row: row2, col: (col2 + 4) % 5}
         ];
      } else {
         return [
            {row: (row1 + 4) % 5, col: col1},
            {row: (row2 + 4) % 5, col: col2}
         ];
      }
   },

   addToSubstitution: function(cells, substitution, row1, col1, row2, col2) {
      var cellSrc1 = cells[row1][col1];
      var cellSrc2 = cells[row2][col2];
      if ((cellSrc1.l == undefined) || (cellSrc2.l == undefined)) {
         return undefined;
      }
      var dstCoords = this.getDstCoords(row1, col1, row2, col2);
      var cellDst1 = cells[dstCoords[0].row][dstCoords[0].col];
      var cellDst2 = cells[dstCoords[1].row][dstCoords[1].col];

      if ((cellDst1.l == undefined) && (cellDst2.l == undefined)) {
         return undefined;
      }
      if (substitution[cellSrc1.l] == undefined) {
         substitution[cellSrc1.l] = [];
      }
      if (substitution[cellSrc2.l] == undefined) {
         substitution[cellSrc2.l] = [];
      }
      substitution[cellSrc1.l][cellSrc2.l] = {
         src: [{l: cellSrc1.l, q: cellSrc1.q }, {l: cellSrc2.l, q: cellSrc2.q }],
         dst: [{l: cellDst1.l, q: cellDst1.q }, {l: cellDst2.l, q: cellDst2.q }]
      };
      substitution[cellSrc2.l][cellSrc1.l] = {
         src: [{l: cellSrc2.l, q: cellSrc2.q }, {l: cellSrc1.l, q: cellSrc1.q }],
         dst: [{l: cellDst2.l, q: cellDst2.q }, {l: cellDst1.l, q: cellDst1.q }]
      }
   },

   getSubstitutionFromGridCells: function(cells) {
      var substitution = [];
      var nbRows = cells.length;
      var nbCols = cells[0].length;
      for (var row1 = 0; row1 < nbRows; row1++) {
         for (var col1 = 0; col1 < nbCols; col1++) {
            var startCol2 = col1 + 1;
            for (var row2 = row1; row2 < nbRows; row2++) {
               for (var col2 = startCol2; col2 < nbCols; col2++) {
                   playFair.addToSubstitution(cells, substitution, row1, col1, row2, col2);
               }
               startCol2 = 0;
            }
         }
      }
      return substitution;
   },


   getLetterToCoordsInGrid: function(cells) {
      var letterToCoords = {};
      var nbRows = cells.length;
      var nbCols = cells[0].length;
      for (var row = 0; row < nbRows; row++) {
         for (var col = 0; col < nbCols; col++) {
            var cell = cells[row][col];
            if (cell.l != undefined) {
               letterToCoords[cell.l] = { row: row, col: col };
            }
         }
      }
      return letterToCoords;
   },

   getSubstPairsWithCoords: function(newCells, substitution) {
      var letterToCoords = this.getLetterToCoordsInGrid(newCells);
      var substPairs = [];
      for (var l1 = 0; l1 < substitution.length; l1++) {
         if (substitution[l1] == undefined) {
            continue;
         }
         for (var l2 = l1 + 1; l2 < substitution[l1].length; l2++) {
            var substPair = substitution[l1][l2];
            if (substPair != undefined) {
               var coordsSrc1 = letterToCoords[l1];
               var coordsSrc2 = letterToCoords[l2];
               if ((coordsSrc1 != undefined) && (coordsSrc2 != undefined)) {
                  substPairs.push({
                     pair: substPair,
                     rows: [coordsSrc1.row, coordsSrc2.row],
                     cols: [coordsSrc1.col, coordsSrc2.col]
                  });
               }
            }
            if (substitution[l2] != undefined) {
               substPair = substitution[l2][l1];
               if (substPair != undefined) {
                  var coordsSrc1 = letterToCoords[l2];
                  var coordsSrc2 = letterToCoords[l1];
                  if ((coordsSrc1 != undefined) && (coordsSrc2 != undefined)) {
                     substPairs.push({
                        pair: substPair,
                        rows: [coordsSrc1.row, coordsSrc2.row],
                        cols: [coordsSrc1.col, coordsSrc2.col]
                     });
                  }
               }
            }
         }
      }
      return substPairs;
   },

   applySubstPairToCells: function(substPairWithCoords, newCells, conflicts, letterToCoords) {
      var modifs = false;
      var dstCoords = this.getDstCoords(substPairWithCoords.rows[0], substPairWithCoords.cols[0], substPairWithCoords.rows[1], substPairWithCoords.cols[1]);
      for (var iDst = 0; iDst < 2; iDst++) {
         var dstRow = dstCoords[iDst].row;
         var dstCol = dstCoords[iDst].col;
         var cellDst = newCells[dstRow][dstCol];
         var substVal = substPairWithCoords.pair.dst[iDst];
         if (substVal.q != "unknown") {
            if (cellDst.q == "unknown") {
               cellDst.l = substVal.l;
               cellDst.q = substVal.q;
               modifs = true;
            } else if (cellDst.l != substVal.l) {
               if (conflicts[dstRow] == undefined) {
                  conflicts[dstRow] = [];
               }
               //alert("essaie de mettre un " + substVal.l + " à la place du " + cellDst.l + " : " + JSON.stringify(substPairWithCoords.pair));
               conflicts[dstRow][dstCol] = true;
            }
         }
      }
      return modifs;
   },

   getSubstitutionPairsForDstCell: function(cells, substitution, row, col) {
      var substPairs = [];
      var substPairsWithCoords = this.getSubstPairsWithCoords(cells, substitution);
      for (var iSubstPair = 0; iSubstPair < substPairsWithCoords.length; iSubstPair++) {
         var substPairWithCoords = substPairsWithCoords[iSubstPair];
         var rows = substPairWithCoords.rows;
         var cols = substPairWithCoords.cols;
         var dstCoords = this.getDstCoords(rows[0], cols[0], rows[1], cols[1]);
         if ((row == dstCoords[0].row) && (col == dstCoords[0].col)) {
            substPairs.push(substPairWithCoords.pair);
         }
      }
      return substPairs;
   },

   getGridFromGridAndSubstitution: function(cells, substitution) {
      var newCells = [];
      var nbRows = cells.length;
      var nbCols = cells[0].length;
      for (var row = 0; row < nbRows; row++) {
         newCells.push([]);
         for (var col = 0; col < nbCols; col++) {
            var cell = cells[row][col];
            var newCell = { q: cell.q };
            if (newCell.q == "locked") {
               newCell.q = "confirmed";
            }
            if (cell.l != undefined) {
               newCell.l = cell.l;
            }
            newCells[row].push(newCell);
         }
      }

      var conflicts = [];
      var modifs = true;

      while (modifs) {
         modifs = false;
         var substPairsWithCoords = this.getSubstPairsWithCoords(newCells, substitution);
         for (var iSubstPair = 0; iSubstPair < substPairsWithCoords.length; iSubstPair++) {
            modifs |= this.applySubstPairToCells(substPairsWithCoords[iSubstPair], newCells, conflicts);
         }
      }

      return {
         cells: newCells,
         conflicts: conflicts         
      }
   }
};
