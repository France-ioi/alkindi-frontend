var common = {
   maxQualifier: {
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
   },

   /* Returns an array giving for each letter of the alphabet, the max qualifier for that letter in the grid */
   getLetterQualifiersFromGrid: function(gridCells, alphabet) {
      var letterQualifiers = [];
      for (var iLetter = 0; iLetter < alphabet.length; iLetter++) {
         letterQualifiers[iLetter] = 'unknown';
      }
      var nbRows = gridCells.length;
      var nbCols = gridCells[0].length;
      for (var row = 0; row < nbRows; row++) {
         for (var col = 0; col < nbCols; col++) {
            var cell = gridCells[row][col];
            if (cell.q != 'unknown') {
               letterQualifiers[cell.l] = common.maxQualifier[letterQualifiers[cell.l]][cell.q];
            }
         }
      }
      return letterQualifiers;
   },

   renderVariable: function(variable) {
      return "<div>" +
            "<span class='variable-label'>" + variable.label + " : </span>" +
            "<div class='code variable-name'>" + variable.name + "</div>" +
         "</div>";
   },

   renderValidateOrCancelDialog: function(name) {
      return "<div style='text-align:center'>" +
         "<button type='button' class='btn-tool' onclick='" + name + ".validateDialog()'>Valider</button>" +
         "&nbsp;&nbsp;&nbsp;" +
         "<button type='button' class='btn-tool' onclick='" + name + ".cancelDialog()'>Annuler</button>" +
         "</div>";
   },

   renderVariables: function(variables) {
      var html = "<div class='playfair-variables'>";
      
      if ((variables.input != undefined) && (variables.input.length > 0)) {
         html += "<div class='variable-entree variable-informations'>";
         html += "<span>Variables d'entrée :</span>";
         for (var iVar = 0; iVar < variables.input.length; iVar++) {
            html += common.renderVariable(variables.input[iVar]);
         }
         html += "</div>";
      }
      if ((variables.output != undefined) && (variables.output.length > 0)) {
         html += "<div class='variable-sortie variable-informations'>";
         html += "<span>Variables de sortie :</span>";
         for (var iVar = 0; iVar < variables.output.length; iVar++) {
            html += common.renderVariable(variables.output[iVar]);
         }
         html += "</div>";
      }
      html += "</div>";
      return html;
   },

   renderGridPython: function(grid, renderCellFct) {
      strPython = "[";
      var nbRows = grid.length;
      var nbCols = grid.length;
      for (var row = 0; row < nbRows; row++) {
         strPython += "[";
         for (var col = 0; col < nbCols; col++) {
            if (col != 0) {
               strPython += ", ";
            }
            var cell = grid[row][col];
            strPython += renderCellFct(grid[row][col]);
         }
         strPython += "]";
      }
      strPython += "];";
      return strPython;
   },
   
   getCellLetter: function(alphabet, cell, useNbsp) {
      if (cell.q === 'unknown') {
         if (useNbsp) {
            return '&nbsp;';
         } else {
            return '';
         }
      } else {
         return alphabet[cell.l];
      }
   },

   getLetterRanks: function(alphabet) {
      var letterRanks = {};
      for (var iLetter = 0; iLetter < alphabet.length; iLetter++) {
         letterRanks[alphabet[iLetter]] = iLetter;
      }
      return letterRanks;
   },
   
   renderLock: function(locked) {
      if (locked) {
         return "<i class='fa fa-lock'></i>";
      } else {
         return "&nbsp;";
      }
   },

   updateCell: function(inputCell, editedCell, outputCell) {
      if ((editedCell.q == 'unknown') ||
          ((editedCell.q == 'guess') && (inputCell.q != 'guess') && (inputCell.q != 'unknown'))) {
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
   },

   getWrappingInfos: function(text, maxWidth, alphabet) {
      var letterRanks = common.getLetterRanks(alphabet);
      var lineStartCols = [0];
      var col = 0;
      var nextCut = 0;
      var lastNonAlphabet = 0;
      var lastNonAlphabetBeforeLetter = 0;
      for (var iLetter = 0; iLetter < text.length; iLetter++) {
         if (col >= maxWidth) {
            lineStartCols.push(lastNonAlphabetBeforeLetter + 1);
            col = iLetter - (lastNonAlphabetBeforeLetter + 1);
         }
         var letter = text[iLetter];
         if (letterRanks[letter] == undefined) {
            lastNonAlphabet = iLetter;
         } else {
            lastNonAlphabetBeforeLetter = lastNonAlphabet;
         }
         col++;
      }
      lineStartCols.push(text.length);
      return lineStartCols;
   },

   testWrapping: function(text, maxWidth, alphabet) {
      var lineStartCols = common.getWrappingInfos(text, maxWidth, alphabet);
      for (var iLine = 0; iLine < lineStartCols.length - 1; iLine++) {
         var startCol = lineStartCols[iLine];
         var endCol = lineStartCols[iLine + 1];
         var line = text.substring(startCol, endCol);
         console.log(line);
      }
   },

   stringAsCells: function(string, alphabet) {
      var cells = [];
      var letterRanks = common.getLetterRanks(alphabet);
      for (var iLetter = 0; iLetter < string.length; iLetter++) {
         cells.push({ l: letterRanks[string.charAt(iLetter)] });
      }
      return cells;
   },
   
   cellsAsString: function(cells, alphabet) {
      var text = "";
      for (var iLetter = 0; iLetter < cells.length; iLetter++) {
         var letter = " ";
         if (cells[iLetter].q != "unknown") {
            letter = alphabet[cells[iLetter].l];
         }
         text += letter;
      }
      return text;
   },

   coincidenceIndex: function(text, alphabet) {
      var nbLetters = text.length;
      var occurrences = [];
      for (var letter = 0; letter < alphabet.length; letter++) {
         occurrences[letter] = 0;
      }
      for (var iLetter = 0; iLetter < text.length; iLetter++) {
         var letter = text[iLetter].l;
         occurrences[letter]++;
      }
      var coincidence = 0;
      for (var letter = 0; letter < alphabet.length; letter++) {
           var proba = occurrences[letter] * (occurrences[letter] - 1) / (nbLetters * (nbLetters - 1));
      coincidence += proba;
      }
      return coincidence;
   },

   genPermutations: function(partialPermutation) {
      var permutations = [];
      var curPermutation = [];
      var valuesAvailable = [];
      for (var iPos = 0; iPos < partialPermutation.length; iPos++) {
         valuesAvailable[iPos] = 1;
      }
      for (var iPos = 0; iPos < partialPermutation.length; iPos++) {
         if (partialPermutation[iPos].q != "unknown") {
            valuesAvailable[partialPermutation[iPos].dstPos] = 0;
         }
      }
      common.recFillPermutations(partialPermutation, permutations, valuesAvailable, curPermutation, 0);
      return permutations;
   },
   
   recFillPermutations: function(partialPermutation, permutations, valuesAvailable, curPermutation, curPos) {
      if (curPos >= partialPermutation.length) {
         var copyPermutation = [];
         for (var iPos = 0; iPos < curPermutation.length; iPos++) {
            copyPermutation.push(curPermutation[iPos]);
         }
         permutations.push(copyPermutation);
         return;
      }
      if (partialPermutation[curPos].q != "unknown") {
         curPermutation[curPos] = partialPermutation[curPos].dstPos;
         common.recFillPermutations(partialPermutation, permutations, valuesAvailable, curPermutation, curPos + 1);
         return;
      }
      for (var value = 0; value < valuesAvailable.length; value++) {
         if (valuesAvailable[value]) {
            curPermutation[curPos] = value;
            valuesAvailable[value] = 0;
            common.recFillPermutations(partialPermutation, permutations, valuesAvailable, curPermutation, curPos + 1);
            valuesAvailable[value] = 1;
         }
      }
   },

   applyPermutation: function(cells, permutation) {
      var dstCells = [];
      var length = cells.length;
      if (length % permutation.length != 0) {
         length = length - (length % permutation.length) + permutation.length;
      }
      for (var srcPos = 0; srcPos < length; srcPos++) {
         var srcCell;
         if (cells.length > srcPos) {
            srcCell = cells[srcPos];
         } else {
            srcCell = {q: "unknown" };
         }
         var modulo = srcPos % permutation.length;
         var dstPos = srcPos - modulo + permutation[modulo];
         dstCells[dstPos] = srcCell;
      }
      return dstCells;
   }
}