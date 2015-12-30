var playFair = {
   alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'],

   sampleGrid: [
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {l:0, q:'locked'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {l:7, q:'confirmed'}, {q:'unknown'}, {l:4, q:'confirmed'}, {q:'unknown'}],
      [{l:9, q:'confirmed'}, {l:20, q:'confirmed'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
   ],

   // TODO : ne pas passer self mais les parties qui seront utilisées
   // Deviendra un composant react => sebc s'en occupera
   getGridHtml: function(self, getCellLetterFct) {
      var strHtml = "<table class='playFairGrid'>";
      var cells = self.state.inputGridCells;
      var nbRows = cells.length;
      var nbCols = cells[0].length;
      for (var iRow = 0; iRow < nbRows; iRow++) {
         strHtml += "<tr>";
         for (var iCol = 0; iCol < nbCols; iCol++) {
            var cell = cells[iRow][iCol];
            var queryClass = "";
            if (self.state.hintQuery != null) {
               var query = self.state.hintQuery;
               if ((query.type === 'grid') && (query.row === iRow) && (query.col === iCol)) {
                  queryClass = "cell-query";
               }
            }
            strHtml += "<td class='" + queryClass + " " + "qualifier-" + cell.q + "' onClick='" + self.name + ".clickGridCell(" + iRow + "," + iCol + ")'>";
            strHtml += getCellLetterFct(cell);
            strHtml += "</td>";
         }
         strHtml += "</tr>";
      }
      strHtml += "</table>";
      return strHtml;
   },

   addToSubstitution: function(cells, substitution, iRow1, iCol1, iRow2, iCol2) {
      var cellSrc1 = cells[iRow1][iCol1];
      var cellSrc2 = cells[iRow2][iCol2];
      if ((cellSrc1.l == undefined) || (cellSrc2.l == undefined)) {
         return null;
      }
      var cellDst1;
      var cellDst2;

      if ((iRow1 != iRow2) && (iCol1 != iCol2)) {
         cellDst1 = cells[iRow1][iCol2];
         cellDst2 = cells[iRow2][iCol1];
      } else if (iRow1 == iRow2) {
         cellDst1 = cells[iRow1][(iCol1 + 4) % 5];
         cellDst2 = cells[iRow2][(iCol2 + 4) % 5];
      } else {
         cellDst1 = cells[(iRow1 + 4) % 5][iCol1];
         cellDst2 = cells[(iRow2 + 4) % 5][iCol2];
      }

      if ((cellDst1.l == undefined) && (cellDst2.l == undefined)) {
         return null;
      }
      if (substitution[cellSrc1.l] == undefined) {
         substitution[cellSrc1.l] = [];
      }
      if (substitution[cellSrc2.l] == undefined) {
         substitution[cellSrc2.l] = [];
      }
      substitution[cellSrc1.l][cellSrc2.l] = {
         l1: cellDst1.l,
         l2: cellDst2.l,
         q1: cellDst1.q,
         q2: cellDst2.q
      };
      substitution[cellSrc2.l][cellSrc1.l] = {
         l1: cellDst2.l,
         l2: cellDst1.l,
         q1: cellDst2.q,
         q2: cellDst1.q
      }
   },

   getSubstitutionFromGridCells: function(cells) {
      var substitution = [];
      var nbRows = cells.length;
      var nbCols = cells[0].length;
      for (var iRow1 = 0; iRow1 < nbRows; iRow1++) {
         for (var iCol1 = 0; iCol1 < nbCols; iCol1++) {
            var startCol2 = iCol1 + 1;
            for (var iRow2 = iRow1; iRow2 < nbRows; iRow2++) {
               for (var iCol2 = startCol2; iCol2 < nbCols; iCol2++) {
                   playFair.addToSubstitution(cells, substitution, iRow1, iCol1, iRow2, iCol2);
               }
               startCol2 = 0;
            }
         }
      }
      return substitution;
   }
};
