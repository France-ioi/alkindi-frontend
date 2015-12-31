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
   renderGrid: function(cells, renderCellLetterFct, selectedRow, selectedCol) {
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
            strHtml += "<td class='" + queryClass + " " + "qualifier-" + cell.q + "' onClick='" + self.name + ".clickGridCell(" + row + "," + col + ")'>";
            strHtml += renderCellLetterFct(cell);
            strHtml += "</td>";
         }
         strHtml += "</tr>";
      }
      strHtml += "</table>";
      return strHtml;
   },

   addToSubstitution: function(cells, substitution, row1, col1, row2, col2) {
      var cellSrc1 = cells[row1][col1];
      var cellSrc2 = cells[row2][col2];
      if ((cellSrc1.l == undefined) || (cellSrc2.l == undefined)) {
         return undefined;
      }
      var cellDst1;
      var cellDst2;

      if ((row1 != row2) && (col1 != col2)) {
         cellDst1 = cells[row1][col2];
         cellDst2 = cells[row2][col1];
      } else if (row1 == row2) {
         cellDst1 = cells[row1][(col1 + 4) % 5];
         cellDst2 = cells[row2][(col2 + 4) % 5];
      } else {
         cellDst1 = cells[(row1 + 4) % 5][col1];
         cellDst2 = cells[(row2 + 4) % 5][col2];
      }

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
         src1 : {l: cellSrc1.l, q: cellSrc1.q },
         src2 : {l: cellSrc2.l, q: cellSrc2.q },
         dst1 : {l: cellDst1.l, q: cellDst1.q },
         dst2 : {l: cellDst2.l, q: cellDst2.q }
      };
      substitution[cellSrc2.l][cellSrc1.l] = {
         src2 : {l: cellSrc1.l, q: cellSrc1.q },
         src1 : {l: cellSrc2.l, q: cellSrc2.q },
         dst2 : {l: cellDst1.l, q: cellDst1.q },
         dst1 : {l: cellDst2.l, q: cellDst2.q }
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
   }
};
