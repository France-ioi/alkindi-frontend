function getSubstitutionFromGrid() {
   var self = {};

   self.name = "substitutionFromGrid";

   self.state = {
      alphabet: playFair.alphabet,
      inputGridCells: playFair.sampleGrid,
      outputGridCells: playFair.sampleGrid,
      inputGridVariable: "lettresGrilleIndice",
      outputSubstitutionVariable: "substitutionDépart",
      editState: undefined,
      edit: undefined
   };

   var getCellLetter = function(cell) {
      if (cell.q === 'unknown') {
         return '';
      } else {
         return self.state.alphabet[cell.l];
      }
   };

   var renderCellPython = function(cell) {
      return "'" + getCellLetter(cell) + "'";
   };

   var renderInstructionPython = function() {
      return self.state.outputSubstitutionVariable + " = substitutionDepuisGrille(" + self.state.inputGridVariable + ", " + common.renderGridPython(self.state.inputGridCells, renderCellPython);
   };
   
   var renderGrid = function() {
      var selectedRow;
      var selectedCol;
      if (self.state.editState == "preparing") {
         selectedRow = self.state.edit.row;
         selectedCol = self.state.edit.col;
      }
      return playFair.renderGrid(self, getCellLetter, selectedRow, selectedCol);
   };

   var getPairLetterClass = function(cell) {
      if ((cell.q == "locked") || (cell.q == "confirmed")) {
         return "qualifier-confirmed";
      }
      return "";
   }

   var renderSubstitutionPair = function(pair) {
      return "<table style='display:inline-block'><tr><td>" +
            "<table class='substitutionPair'><tr>" +
            "<td class='" + getPairLetterClass(pair.src1) + "'>" + getCellLetter(pair.src1) + "</td>" +
            "<td class='" + getPairLetterClass(pair.src2) + "'>" + getCellLetter(pair.src2) + "</td>" +
         "</tr></table>" +
         "</td>" +
         "<td> -> </td>" +
         "<td><table class='substitutionPair'><tr>" +
            "<td class='" + getPairLetterClass(pair.dst1)+ "'>" + getCellLetter(pair.dst1) + "</td>" +
            "<td class='" + getPairLetterClass(pair.dst2) + "'>" + getCellLetter(pair.dst2) + "</td>" +
         "</tr></table>" +
         "</td></tr></table>";
   }

   var renderSubstitution = function() {
      var html = "<div style='height:100px;width:400px;border: solid black 1px;overflow-y:scroll'>";
      var substitution = playFair.getSubstitutionFromGridCells(self.state.inputGridCells);
      var nbLetters = playFair.alphabet.length;
      for (var src1 = 0; src1 < nbLetters; src1++) {
         for (var src2 = src1 + 1; src2 < nbLetters; src2++) {
            if ((substitution[src1] != undefined) && (substitution[src1][src2] != undefined)) {
               html += renderSubstitutionPair(substitution[src1][src2]);
               html += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
               html += renderSubstitutionPair(substitution[src2][src1]);
            }
         }
      }
      html += "</div>";
      return html;
   };

   var renderEditCell = function() {
      if (self.state.editState == "preparing") {
         var row = self.state.edit.row;
         var col = self.state.edit.col;
         return "<div class='dialog'>" +
               "<table>" +
                  "<tr>" +
                     "<td><strong>Case éditée :</strong></td>" +
                     "<td>ligne " + (row + 1) + ", colonne " + (col + 1) + "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Valeur d'origine :</strong></td>" +
                     "<td>" + getCellLetter(self.state.inputGridCells[row][col]) + "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Nouvelle valeur :</strong></td>" +
                     "<td><input type='text' style='width:60px' value='" + getCellLetter(self.state.outputGridCells[row][col]) + "'></td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Bloquer / débloquer :</strong></td>" +
                     "<td><button style='width:60px'><img src='lock.png'></button></td>" +
                  "</tr>" +
               "</table>" +
               common.renderValidateOrCancelDialog(self.name) +
            "</div>";
      } else if (self.state.editState == "invalid") {
         return "<div class='dialog'>Le contenu de cette case est déjà confirmé</div>";
      } else {
         return "";
      }
   };

   self.clickGridCell = function(row, col) {
      var inputCell = self.state.inputGridCells[row][col];
      if (inputCell.q == 'confirmed') {
         self.state.editState = "invalid";
      } else {
         self.state.editState = "preparing";
         self.state.edit = {
            row: row,
            col: col
         }
      }
      self.render();
   };

   self.validateDialog = function() {
      // TODO
      self.cancelDialog();
   }

   self.cancelDialog = function() {
      self.state.edit = undefined;
      self.state.editState = undefined;
      self.render();
   }

   var renderVariables = function() {
      return common.renderVariables({
         input: [
            {label: "Grille playFair", name: self.state.inputGridVariable}
         ],
         output: [
            {label: "Grille modifiée", name: self.state.inputGridVariable},
            {label: "Substitution générée", name: self.state.outputSubstitutionVariable}
         ]
      });
   };

   var renderTool = function() {
      return "<div style='width:700px;border: solid black 1px'>" +
            "<div style='width:100%;border: solid black 1px;box-sizing: border-box;padding:3px'>" + 
               renderInstructionPython() +
            "</div>" +
            "<div style='overflow:auto'>" +
               "<div style='float:right; margin:3px'>" +
                  renderEditCell() +
               "</div>" +
               renderVariables() +
            "</div>" +
            "<span style='clear:both'></span>" + 
            "<div style='display:inline-block;vertical-align:middle;margin:3px'>" + 
               renderGrid() +
            "</div>" +
            "<div style='display:inline-block;vertical-align:middle;padding-left:40px'>" +
               "Substitution de bigrammes générée :<br/>" +
               renderSubstitution() +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById(self.name).innerHTML = renderTool();
   }

   return self;
}
