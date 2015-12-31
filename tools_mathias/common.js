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
      return "<tr>" +
            "<td>&nbsp;&nbsp;&nbsp;&nbsp;<strong>" + variable.label + " : </strong></td>" +
            "<td><div style='display:inline-block;width:140px;text-align:center;border:solid black 1px'>" + variable.name + "</div></td>" +
         "</tr>";
   },

   renderValidateOrCancelDialog: function(name) {
      return "<div style='text-align:center'>" +
         "<button onclick='" + name + ".validateDialog()'>Valider</button>" +
         "&nbsp;&nbsp;&nbsp;" +
         "<button onclick='" + name + ".cancelDialog()'>Annuler</button>" +
         "</div>";
   },

   renderVariables: function(variables) {
      var html = "<table>";
      
      if (variables.input != undefined) {
         html += "<tr><td><strong>Variables d'entrée :</strong></td></tr>";
         for (var iVar = 0; iVar < variables.input.length; iVar++) {
            html += this.renderVariable(variables.input[iVar]);
         }
      }
      if (variables.output != undefined) {
         html += "<tr><td><strong>Variables de sortie :</strong></td></tr>";
         for (var iVar = 0; iVar < variables.output.length; iVar++) {
            html += this.renderVariable(variables.output[iVar]);
         }
      }
      html += "</table>";
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
   }
}