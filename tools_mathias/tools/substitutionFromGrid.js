function getSubstitutionFromGrid() {
   var self = {};

   self.name = "substitutionFromGrid";

   self.props = {
      alphabet: playFair.alphabet,
      inputGridCells: playFair.sampleGrid,
      outputGridCells: [],
      outputSubstitution: [],
      inputGridVariable: "lettresGrilleIndice",
      outputGridVariable: "lettresGrilleEditée",
      outputSubstitutionVariable: "substitutionDépart"
   };

   self.state = {
      editState: undefined,
      edit: undefined
   };

   self.compute = function() {
      playFair.updateCells(self.props.inputGridCells, self.props.outputGridCells);
      self.props.outputSubstitution = playFair.getSubstitutionFromGridCells(self.props.outputGridCells);
   };

   var renderCellPython = function(cell) {
      return "'" + common.getCellLetter(playFair.alphabet, cell) + "'";
   };

   var renderInstructionPython = function() {
      return "<span class='code-var'>" + self.props.outputSubstitutionVariable + "</span> = substitutionDepuisGrille(" + self.props.inputGridVariable + ", " + common.renderGridPython(self.props.inputGridCells, renderCellPython);
   };
   
   var renderGrid = function() {
      var selectedRow;
      var selectedCol;
      if (self.state.editState == "preparing") {
         selectedRow = self.state.edit.row;
         selectedCol = self.state.edit.col;
      }
      return playFair.renderGrid(self.name, self.props.outputGridCells, selectedRow, selectedCol);
   };

   var renderSubstitution = function() {
      var substitution = self.props.outputSubstitution;
      var nbLetters = playFair.alphabet.length;
      var items = [];
      for (var src1 = 0; src1 < nbLetters; src1++) {
         for (var src2 = src1 + 1; src2 < nbLetters; src2++) {
            if ((substitution[src1] !== undefined) && (substitution[src1][src2] !== undefined)) {
               items.push(
                  "<div>" +
                     bigramsUtils.renderSubstitutionPair(substitution[src1][src2], playFair.alphabet) +
                     bigramsUtils.renderSubstitutionPair(substitution[src2][src1], playFair.alphabet) +
                  "</div>"
               );
            }
         }
      }
      return "<div id='bigramSubstitution'>" + items.join('') + "</div>";
   };

   var renderEditCell = function() {
      if (self.state.editState == "preparing") {
         var row = self.state.edit.row;
         var col = self.state.edit.col;
         var inputCell = self.props.inputGridCells[row][col];
         var outputCell = self.props.outputGridCells[row][col];
         var buttonLockedClass = "";
         if (self.state.edit.locked) {
            buttonLockedClass = "locked";
         }
         return "<div class='dialog'>" +
               "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Valeur d'origine :</span>" +
                     "<span>" + common.getCellLetter(playFair.alphabet, inputCell, true) + "</span>" +
               "</div>" +
               "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Nouvelle valeur :</span>" +
                     "<span>" +
                        "<input id='editCellLetter' onchange='" + self.name + ".changeCellLetter()' type='text' maxlength=1 style='width:60px;text-align:center' " +
                           "value='" + self.state.edit.cellLetter + "'>" +
                     "</span>" +
               "</div>" +
               "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>&nbsp;</span>" +
                     "<span class='dialogLock'>" +
                        "<span class='substitutionLock'>" + common.renderLock(self.state.edit.locked) + "</span>" +
                     "</span>" +
               "</div>" +
               "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Bloquer / débloquer :</span>" +
                     "<span>" +
                        "<button id='toggleLockLetter' onclick='" + self.name + ".toggleLockLetter()' type='button' class='" + buttonLockedClass + "'>" +
                           "<i class='fa fa-lock'></i>" +
                        "</button>" +
                     "</span>" +
               "</div>" +
               common.renderValidateOrCancelDialog(self.name) +
            "</div>";
      } else if (self.state.editState == "invalid") {
         return "<div class='dialog'>Le contenu de cette case est déjà confirmé</div>";
      } else {
         return "";
      }
   };

   self.clickGridCell = function(row, col) {
      var inputCell = self.props.inputGridCells[row][col];
      var outputCell = self.props.outputGridCells[row][col];
      if (inputCell.q == 'confirmed') {
         self.state.editState = "invalid";
      } else {
         self.state.editState = "preparing";
         self.state.edit = {
            row: row,
            col: col,
            locked: (outputCell.q == "locked"),
            cellLetter: common.getCellLetter(playFair.alphabet, outputCell)
         }
      }
      self.render();
   };

   self.changeCellLetter  = function() {
      self.state.edit.cellLetter = document.getElementById("editCellLetter").value;
   };

   self.toggleLockLetter = function() {
      self.state.edit.locked = !self.state.edit.locked;
      self.render();
   };

   self.validateDialog = function() {
      var value = self.state.edit.cellLetter;
      var letterRanks = common.getLetterRanks(playFair.alphabet);
      if ((value != '') && (letterRanks[value] == undefined)) {
         alert(value + " n'est pas une valeur possible de la grille");
         return;
      }
      var cell = self.props.outputGridCells[self.state.edit.row][self.state.edit.col];
      if (value == '') {
         cell.q = 'unknown';
         cell.l = undefined;
      } else {
         cell.l = letterRanks[value];
         cell.q = "guess";
         if (self.state.edit.locked) {
            cell.q = "locked";
         }
      }
      self.cancelDialog();
   };

   self.cancelDialog = function() {
      self.state.edit = undefined;
      self.state.editState = undefined;
      self.render();
   };

   var renderVariables = function() {
      return common.renderVariables({
         input: [
            {label: "Grille playFair", name: self.props.inputGridVariable}
         ],
         output: [
            {label: "Grille éditée", name: self.props.outputGridVariable},
            {label: "Substitution générée", name: self.props.outputSubstitutionVariable}
         ]
      });
   };

   var renderTool = function() {
      return "<div class='panel panel-default'>" +
            "<div class='panel-heading'><span class='code'>" + 
               renderInstructionPython() +
            "</span></div>" +
            "<div class='panel-body'>" +
               renderEditCell() +
               renderVariables() +
               "<div class='grillesSection'>" + 
                  "<div class='blocGrille'>" + 
                     "Grille éditée :<br/>" +
                     renderGrid() +
                  "</div>" +
                  "<div class='blocGrille'>" +
                     "Substitution de bigrammes générée :<br/>" +
                     renderSubstitution() +
                  "</div>" +
               "</div>" +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      self.compute();
      document.getElementById(self.name).innerHTML = renderTool();
   }


   return self;
}
