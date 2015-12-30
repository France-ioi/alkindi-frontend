var maxQualifier = {
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
}

/* Returns an array giving for each letter of the alphabet, the max qualifier for that letter in the grid */
function getLetterQualifiersFromGrid(gridCells, alphabet) {
   var letterQualifiers = [];
   for (var iLetter = 0; iLetter < alphabet.length; iLetter++) {
      letterQualifiers[iLetter] = 'unknown';
   }
   var nbRows = gridCells.length;
   var nbCols = gridCells[0].length;
   for (var iRow = 0; iRow < nbRows; iRow++) {
      for (var iCol = 0; iCol < nbCols; iCol++) {
         var cell = gridCells[iRow][iCol];
         if (cell.q != 'unknown') {
            letterQualifiers[cell.l] = maxQualifier[letterQualifiers[cell.l]][cell.q];
         }
      }
   }
   return letterQualifiers;
}

function getVariablesHtml(variables) {
   var html = "<table>";
   for (var iVar = 0; iVar < variables.length; iVar++) {
      var variable = variables[iVar];
      html += "<tr><td><strong>" + variable.label + " : </strong></td>" +
         "<td><div style='display:inline-block;width:140px;text-align:center;border:solid black 1px'>" + variable.name + "</div></td></tr>";
   }
   html += "</table>";
   return html;
}

function getGridPython(grid, getCellFct) {
   strPython = "[";
   var nbRows = grid.length;
   var nbCols = grid.length;
   for (var iRow = 0; iRow < nbRows; iRow++) {
      strPython += "[";
      for (var iCol = 0; iCol < nbCols; iCol++) {
         if (iCol != 0) {
            strPython += ", ";
         }
         var cell = grid[iRow][iCol];
         strPython += getCellFct(grid[iRow][iCol]);
      }
      strPython += "]";
   }
   strPython += "];";
   return strPython;
};
