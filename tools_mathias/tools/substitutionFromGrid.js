function getSubstitutionFromGrid() {
   var self = {};

   self.name = "substitutionFromGrid";

   self.props = {
      alphabet: playFair.alphabet,
      inputGridCells: playFair.sampleGrid,
      outputGridCells: playFair.sampleGrid,
      inputGridVariable: "lettresGrilleIndice",
      outputSubstitutionVariable: "substitutionDépart"
   };

   self.state = {
      editState: undefined,
      edit: undefined
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
      return playFair.renderGrid(self.name, self.props.inputGridCells, selectedRow, selectedCol);
   };

   var renderSubstitution = function() {
      var html = "<div style='height:100px;width:400px;border: solid black 1px;overflow-y:scroll'>";
      var substitution = playFair.getSubstitutionFromGridCells(self.props.inputGridCells);
      var nbLetters = playFair.alphabet.length;
      for (var src1 = 0; src1 < nbLetters; src1++) {
         for (var src2 = src1 + 1; src2 < nbLetters; src2++) {
            if ((substitution[src1] != undefined) && (substitution[src1][src2] != undefined)) {
               html += "<div>";
               html += bigramsUtils.renderSubstitutionPair(substitution[src1][src2], playFair.alphabet);
               html += bigramsUtils.renderSubstitutionPair(substitution[src2][src1], playFair.alphabet);
               html += "</div>";
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
                     "<td>" + common.getCellLetter(playFair.alphabet, self.props.inputGridCells[row][col]) + "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Nouvelle valeur :</strong></td>" +
                     "<td><input type='text' style='width:60px' value='" + common.getCellLetter(playFair.alphabet, self.props.outputGridCells[row][col]) + "'></td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Bloquer / débloquer :</strong></td>" +
                     "<td><button type='button' class='locked'><i class='fa fa-lock'></i></button></td>" +
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
      var inputCell = self.props.inputGridCells[row][col];
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
            {label: "Grille playFair", name: self.props.inputGridVariable}
         ],
         output: [
            {label: "Grille modifiée", name: self.props.inputGridVariable},
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
               "<div style='overflow:auto'>" +
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
            "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById(self.name).innerHTML = renderTool();
   }

   return self;
}
