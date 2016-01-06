function getSubstitutionToPlayFairGrid() {
   var self = {};
   
   self.name = "substitutionToPlayFairGrid";

   self.props = {
      alphabet: playFair.alphabet,
      inputGridCells: playFair.sampleGrid,
      inputSubstitution: playFair.getSampleSubstitutionWithConflict(),
      ouputGridCells: playFair.sampleGrid,
      inputGridVariable: "lettresGrilleIndice",
      inputSubstitutionVariable: "substitutionAméliorée",
      outputGridVariable: "lettresNouvelleGrille"
   };

   self.state = {
   }

   var generatedCells;

   self.compute = function() {
      generatedCells = playFair.getGridFromGridAndSubstitution(self.props.inputGridCells, self.props.inputSubstitution);
      self.props.outputGridCells = generatedCells.cells;
   };

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
      renderAll();
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
         return "<p>Sélectionnez une case de la grille pour voir les substitution qui la définissent.<br/>Pour les celles encadrées en rouge, les causes de conflits seront affichées.</p>";
      }
      var letter = self.props.outputGridCells[self.state.edit.row][self.state.edit.col].l;
      var strLetter = playFair.alphabet[letter];
      var substPairs = playFair.getSubstitutionPairsForDstCell(self.props.outputGridCells, self.props.inputSubstitution, self.state.edit.row, self.state.edit.col);
      var samePairs = [];
      var diffPairs = [];
      for (var iPair = 0; iPair < substPairs.length; iPair++) {
         var pair = substPairs[iPair];
         if (pair.dst[0].l == letter) {
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
         html += samePairs.length + " substitution(s) donnant la lettre " + strLetter + " en première position :<br/>" +
            "<div class='bigramSubstitution y-scrollBloc' style='height:" + height + "px;'>";
         for (var iPair = 0; iPair < samePairs.length; iPair++) {
            var pair = samePairs[iPair];
            html += bigramsUtils.renderSubstitutionPair(pair, playFair.alphabet);
         }
         html += "</div>";
      }
      if (diffPairs.length > 0) {
         html += "<p>" + diffPairs.length + " substitution(s) donnant une lettre <strong>différente de " + strLetter + "</strong> en première position :</p>" +
            "<div class='bigramSubstitution y-scrollBloc' style='height:" + height + "px;'>";
         for (var iPair = 0; iPair < diffPairs.length; iPair++) {
            var pair = diffPairs[iPair];
            html += bigramsUtils.renderSubstitutionPair(pair, playFair.alphabet);
         }
         html += "</div>";
      }
      if ((html == "") && (letter != undefined)) {
         html += "La lettre " + strLetter + " n'est définie par aucune substitution.";

      }
      return html;
   };

   var renderTool = function() {
      return "<div class='panel panel-default'>" +
            "<div class='panel-heading'><span class='code'>" +
               renderInstructionPython() +
            "</span></div>" +
            "<div class='panel-body'>" +
               renderVariables() +
               "<div class='grillesSection'>" +
                  "<p class='title'>Conflits :</p>" + // TODO : conflits
                  "<div class='blocGrille'>" +
                     "<p class='title'>Grille Playfair reconstituée :</p>" +
                     "<div style='display:inline-block;vertical-align:middle;margin:3px'>" +
                        renderGrid() +
                     "</div>" +
                  "</div>" +
                  "<div class='blocGrille'>" +
                     renderConflicts() +
                  "</div>" +
               "</div>" +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      self.compute();
      document.getElementById(self.name).innerHTML = renderTool();
   };

   return self;
}
