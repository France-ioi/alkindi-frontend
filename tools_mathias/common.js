var common = {
   maxQualifier: {
      'unknown': {
         'unknown': 'unknown',
         'guess': 'guess',
         'locked': 'locked',
         'confirmed': 'confirmed'
      },
      'guess': {
         'unknown': 'guess',
         'guess': 'guess',
         'locked': 'locked',
         'confirmed': 'confirmed'
      },
      'locked': {
         'unknown': 'locked',
         'guess': 'locked',
         'locked': 'locked',
         'confirmed': 'confirmed'
      },
      'confirmed': {
         'unknown': 'confirmed',
         'guess': 'confirmed',
         'locked': 'confirmed',
         'confirmed': 'confirmed'
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
               letterQualifiers[cell.l] = this.maxQualifier[letterQualifiers[cell.l]][cell.q];
            }
         }
      }
      return letterQualifiers;
   },

   renderVariable: function(variable) {
      return "<div>" +
            "<span class='variable-label'>" + variable.label + " : </span>" +
            "<div style='display:inline-block;width:140px;text-align:center;border:solid black 1px'>" + variable.name + "</div>" +
         "</div>";
   },

   renderValidateOrCancelDialog: function(name) {
      return "<div style='text-align:center'>" +
         "<button onclick='" + name + ".validateDialog()'>Valider</button>" +
         "&nbsp;&nbsp;&nbsp;" +
         "<button onclick='" + name + ".cancelDialog()'>Annuler</button>" +
         "</div>";
   },

   renderVariables: function(variables) {
      var html = "<div class='playfair-variables'>";
      
      if (variables.input != undefined) {
         html += "<div><span class='variable-name'>Variables d'entrée :</span></div>";
         for (var iVar = 0; iVar < variables.input.length; iVar++) {
            html += this.renderVariable(variables.input[iVar]);
         }
      }
      if (variables.output != undefined) {
         html += "<div><span class='variable-name'>Variables de sortie :</span></div>";
         for (var iVar = 0; iVar < variables.output.length; iVar++) {
            html += this.renderVariable(variables.output[iVar]);
         }
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
   
   getCellLetter: function(alphabet, cell) {
      if (cell.q === 'unknown') {
         return '';
      } else {
         return alphabet[cell.l];
      }
   }
}