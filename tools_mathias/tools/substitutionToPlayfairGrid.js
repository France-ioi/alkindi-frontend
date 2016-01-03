function getSubstitutionToPlayFairGrid() {
   var self = {};
   
   self.name = "substitutionToPlayFairGrid";

   self.props = {
      alphabet: playFair.alphabet,
      inputGridCells: playFair.sampleGrid,
      inputSubstitution: playFair.getSampleSubstitutionWithConflict(),
      ouputGridCells: playFair.sampleGrid,
      inputGridVariable: "lettresGrilleIndice",
      inputSubstitutionVariable: "nouvelleSubstitution",
      outputGridVariable: "lettresNouvelleGrille"
   };

   self.state = {
   }

   var generatedCells = playFair.getGridFromGridAndSubstitution(self.props.inputGridCells, self.props.inputSubstitution);
   self.props.outputGridCells = generatedCells.cells;

   var renderCellPython = function(cell) {
      return "'" + common.getCellLetter(playFair.alphabet, cell) + "'";
   };

   var renderInstructionPython = function() {
      return "<span class='code-var'>" + self.props.outputGridVariable + "</span> = completerGrille(" + self.props.inputGridVariable + ", " + self.props.inputSubstitutionVariable + ")";
   };
   
   self.clickGridCell = function(row, col) {
      var inputCell = self.props.inputGridCells[row][col];
      self.state.editState = "preparing";
      self.state.edit = {
         row: row,
         col: col
      }
      self.render();
   };


   var renderGrid = function() {
      var selectedRow;
      var selectedCol;
      if (self.state.editState == "preparing") {
         selectedRow = self.state.edit.row;
         selectedCol = self.state.edit.col;
      }
      return playFair.renderGrid(self.name, self.props.outputGridCells, selectedRow, selectedCol, function(row, col) {
         if (generatedCells.conflicts[row] != undefined) {
            return generatedCells.conflicts[row][col];
         }
         return false;
      });
   };

   var renderVariables = function() {
      return common.renderVariables({
         input: [
            { label: "Grille initiale", name: self.props.inputGridVariable },
            { label: "Substitution", name: self.props.inputSubstitutionVariable }
         ],
         output: [
            { label: "Grille enregistrée", name: self.props.outputGridVariable}
         ]
      });
   };

   var renderConflicts = function() {
      if (self.state.editState != "preparing") {
         return "";
      }
      var letter = self.props.outputGridCells[self.state.edit.row][self.state.edit.col].l;
      var substPairs = playFair.getSubstitutionPairsForDstCell(self.props.outputGridCells, self.props.inputSubstitution, self.state.edit.row, self.state.edit.col);
      var samePairs = [];
      var diffPairs = [];
      for (var iPair = 0; iPair < substPairs.length; iPair++) {
         var pair = substPairs[iPair];
         if (pair.dst1.l == letter) {
            samePairs.push(pair);
         } else {
            diffPairs.push(pair);
         }
      }

      var height = 150;
      if ((samePairs.length > 0) && (diffPairs.length > 0)) {
         height = 60;
      }
      var html = "";
      if (samePairs.length > 0) {
         html += samePairs.length + " substitution(s) donnant la lettre " + playFair.alphabet[letter] + " en première position :<br/>" +
            "<div style='height:" + height + "px;width:550px;border: solid black 1px;overflow-y:scroll'>";
         for (var iPair = 0; iPair < samePairs.length; iPair++) {
            var pair = samePairs[iPair];
            html += bigramsUtils.renderSubstitutionPair(pair, playFair.alphabet);
         }
         html += "</div>";
      }
      if (diffPairs.length > 0) {
         html += diffPairs.length + " substitution(s) donnant une lettre <strong>différente de " + playFair.alphabet[letter] + "</strong> en première position :<br/>" +
            "<div style='height:" + height + "px;width:550px;border: solid black 1px;overflow-y:scroll'>";
         for (var iPair = 0; iPair < diffPairs.length; iPair++) {
            var pair = diffPairs[iPair];
            html += bigramsUtils.renderSubstitutionPair(pair, playFair.alphabet);
         }
         html += "</div>";
      }
      return html;
   };

   var renderTool = function() {
      return "<div class='panel panel-default'>" +
            "<div class='panel-heading'><span class='code'>" + 
               renderInstructionPython() +
            "</span></div>" +
            "<div class='panel-body'>" + 
               "<div>" +
                  renderVariables() +
                  "<strong>Conflits :</strong>" + // TODO : conflits
               "</div>" +
               "<strong>Grille Playfair reconstituée :</strong><br/>" +
               "<div style='display:inline-block;vertical-align:middle;margin:3px'>" + 
                     renderGrid() +
               "</div>" +
               "<div style='display:inline-block;vertical-align:middle;padding-left:40px'>" +
                  renderConflicts() +
               "</div>" +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById(self.name).innerHTML = renderTool();
   };

   return self;
}
