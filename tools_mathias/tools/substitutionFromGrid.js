function getSubstitutionFromGrid() {
   var self = {};

   self.state = {
      alphabet: playFair.alphabet,
      inputGridCells: playFair.sampleGrid,
      inputGridVariable: "lettresGrilleIndice",
      outputSubstitutionVariable: "substitutionDépart"
   };

   var getCellLetter = function(cell) {
      if (cell.q === 'unknown') {
         return '';
      } else {
         return self.state.alphabet[cell.l];
      }
   };

   var getCellPython = function(cell) {
      return "'" + getCellLetter(cell) + "'";
   };

   var getInstructionPython = function() {
      return self.state.outputSubstitutionVariable + " = substitutionDepuisGrille(" + self.state.inputGridVariable + ", " + getGridPython(self.state.inputGridCells, getCellPython);
   };
   
   var getGridHtml = function() {
      return playFair.getGridHtml(self, getCellLetter);
   };

   var getSubstitutionPairHtml = function(substitution, src1, src2) {
      var dst = substitution[src1][src2];
      var class1 = "";
      if ((dst.q1 == "locked") || (dst.q1 == "confirmed")) {
         class1 = "qualifier-confirmed";
      }
      var class2 = "";
      if ((dst.q2 == "locked") || (dst.q2 == "confirmed")) {
         class2 = "qualifier-confirmed";
      }
      var l1;
      if (dst.l1 == undefined) {
         l1 = '';
      } else {
         l1 = playFair.alphabet[dst.l1];
      }
      var l2;
      if (dst.l2 == undefined) {
         l2 = '';
      } else {
         l2 = playFair.alphabet[dst.l2];
      }
      return "<table style='display:inline-block'><tr><td>" +
            "<table class='substitutionPair'><tr>" +
            "<td>" + playFair.alphabet[src1] + "</td>" +
            "<td>" + playFair.alphabet[src2] + "</td>" +
         "</tr></table>" +
         "</td>" +
         "<td> -> </td>" +
         "<td><table class='substitutionPair'><tr>" +
            "<td class='" + class1+ "'>" + l1 + "</td>" +
            "<td class='" + class2 + "'>" + l2 + "</td>" +
         "</tr></table>" +
         "</td></tr></table>";
   }

   var getSubstitutionHtml = function() {
      var html = "<div style='height:100px;width:400px;border: solid black 1px;overflow-y:scroll'>";
      var substitution = playFair.getSubstitutionFromGridCells(self.state.inputGridCells);
      var nbLetters = playFair.alphabet.length;
      for (var src1 = 0; src1 < nbLetters; src1++) {
         for (var src2 = src1 + 1; src2 < nbLetters; src2++) {
            if ((substitution[src1] != undefined) && (substitution[src1][src2] != undefined)) {
               html += getSubstitutionPairHtml(substitution, src1, src2);
               html += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
               html += getSubstitutionPairHtml(substitution, src2, src1);
            }
         }
      }
      html += "</div>";
      return html;
   };

   var getEditCellHtml = function() {
      var html = "<div class='dialog'>" +
         "<table>" +
         "<tr>" +
            "<td><strong>Case éditée :</strong></td>" +
            "<td>ligne " + self.state.edit.row + ", colonne " + self.state.edit.col + "</td>" +
         "</tr>" +
         "<tr>" +
            "<td><strong>Valeur d'origine :</strong></td>" +
            "<td>" + self.inputGridCell
   };

   var clickGridCell = function(iRow, iCol) {
      self.render();
   };

   var getVariables = function() {
      return getVariablesHtml([
         {label: "Grille playFair", name: self.state.inputGridVariable},
         {label: "Substitution générée", name: self.state.outputSubstitutionVariable},
      ]);
   };

   var getToolHtml = function() {
      return "<div style='width:700px;border: solid black 1px'>" +
            "<div style='width:100%;border: solid black 1px;box-sizing: border-box;padding:3px'>" + 
               getInstructionPython() +
            "</div>" +
            "<div style='overflow:auto'>" +
               "<div style='float:right; margin:3px'>" + "TODO" + "</div>" +
               getVariables() +
            "</div>" +
            "<span style='clear:both'></span>" + 
            "<div style='display:inline-block;vertical-align:middle;margin:3px'>" + 
               getGridHtml() +
            "</div>" +
            "<div style='display:inline-block;vertical-align:middle;padding-left:40px'>" +
               "Substitution de bigrammes générée :<br/>" +
               getSubstitutionHtml() +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById('substitutionFromGrid').innerHTML = getToolHtml();
   }

   return self;
}
