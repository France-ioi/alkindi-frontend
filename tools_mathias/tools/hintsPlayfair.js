function getHintsPlayFair() {
   var self = {};
   
   self.name = "hintsPlayFair";

   self.props = {
      alphabet: playFair.alphabet,
      inputGridCells: playFair.sampleGrid,
      score: 470,
      outputGridVariable: "lettresGrilleIndice"
   };

   self.state = {
      hintQuery: { type:'grid', row: 2, col: 3 },
      hintValues: [[],[,0],[],[,,,4],[]],
      hintState: "preparing"
   }

   var renderCellPython = function(cell) {
      return "'" + common.getCellLetter(playFair.alphabet, cell) + "'";
   };

   var renderInstructionPython = function() {
      return "<span class='code-var'>" + self.props.outputGridVariable + "</span> = " + common.renderGridPython(self.props.inputGridCells, renderCellPython);
   };
   
   var renderGrid = function() {
      var selectedRow;
      var selectedCol;
      var query = self.state.hintQuery;
      if (query != undefined) {
         if (query.type === 'grid') {
            selectedRow = query.row;
            selectedCol = query.col;
         }
      }
      return playFair.renderGrid(self.name, self.props.inputGridCells, selectedRow, selectedCol);
   };

   self.clickGridCell = function(row, col) {
      if (self.state.hintState === "waiting") {
         return;
      }
      if (self.props.inputGridCells[row][col].q === "confirmed") {
         self.state.hintQuery = undefined;
         self.state.hintState = "invalid";
      } else {
         self.state.hintQuery = { type:'grid', row: row, col: col };
         self.state.hintState = "preparing";
      }
      self.render();
   };
   
   self.clickGridAlphabet = function(rank) {
      if (self.state.hintState === "waiting") {
         return;
      }
      var qualifiers = common.getLetterQualifiersFromGrid(self.props.inputGridCells, self.props.alphabet);
      if (qualifiers[rank] === "confirmed") {
         self.state.hintState = "invalid";
         self.cancelDialog();
      } else {
         self.state.hintQuery = { type:'alphabet', rank: rank };
         self.state.hintState = "preparing";
      }
      self.render();
   };
   
   var renderAlphabet = function() {
      var qualifiers = common.getLetterQualifiersFromGrid(self.props.inputGridCells, self.props.alphabet);
      var strHtml = "";

      for (var row = 0; row < 2; row++) {
         strHtml += "<table class='playFairAlphabet'>";
         strHtml += "<tr>";
         for (var col = 0; col < 13; col++) {
            var letterRank = row * 13 + col;
            if (letterRank == 22) {
               strHtml += "<td class='qualifier-disabled'></td>";
            } else {
               if (letterRank > 22) { // no W
                  letterRank--;
               }
               var queryClass = "";
               var query = self.state.hintQuery;
               if (query != undefined) {
                  if ((query.type === 'alphabet') && (query.rank === letterRank)) {
                     queryClass = "cell-query";
                  }
               }
               strHtml += "<td class='" + queryClass + " qualifier-" + qualifiers[letterRank] + "' onClick='" + self.name + ".clickGridAlphabet(" + letterRank + ")'>" +
                  self.props.alphabet[letterRank] +
                  "</td>";
            }
         }
         strHtml += "</tr>";
         strHtml += "</table>";
         if (row == 0) {
            strHtml += "<br/>";
         }
      }
      return strHtml;
   };

   var getQueryCost = function(query) {
      if (query.type === "grid") {
         return 10;
      } else {
         return 10;
      }
   }

   var renderHintQuery = function() {
      if (self.state.hintState === "preparing") {
         var query = self.state.hintQuery;
         var message;
         if (query.type === "grid") {
            message = "<span>lettre à la ligne <span class='dialogIndice'>" + (query.row + 1) + "</span>, colonne <span class='dialogIndice'>" + (query.col + 1) + "</span> de la grille.</span>";
         } else {
            message = "<span>position de la lettre <span class='dialogIndice'>" + self.props.alphabet[query.rank] + "</span> dans la grille</span>";
         }
         var cost = getQueryCost(query);
         return "<div class='dialog'>" +
               "<strong>Indice demandé :</strong> " + message + "<br/>" +
               "<strong>Coût :</strong> " + cost + " points<br/>" +
               common.renderValidateOrCancelDialog(self.name) +
            "</div>";
      } else if (self.state.hintState === "waiting") {
         return "<div class='dialog'>En attente de réponse du serveur</div>";
      } else if (self.state.hintState === "received") {
         return "<div class='dialog'>Indice obtenu <button type='button' onclick='" + self.name + ".cancelDialog()'>OK</button></div>";
      } else if (self.state.hintState === "invalid") {
         return "<div class='dialog'>Cet indice a déjà été obtenu</div>";
      }
      return "";
   };

   self.cancelDialog = function() {
      self.state.hintQuery = undefined;
      self.state.hintState = "idling";
      self.render();
   };

   self.validateDialog = function() {
      self.state.hintState = "waiting";
      self.render();
      setTimeout(function() {
         self.state.hintState = "received";
         self.render();
      }, 1000);
   };

   var renderVariables = function() {
      return common.renderVariables({
         output: [
            {label: "Grille enregistrée", name: self.props.outputGridVariable}
         ]
      });
   };

   var renderTool = function() {
      return "<div class='panel panel-default'>" +
            "<div class='panel-heading'><span class='code'>" + 
               renderInstructionPython() +
            "</span></div>" +
            "<div class='panel-body'>" + 
               renderHintQuery() + 
               "<div>" +
                  renderVariables() +
                  "<strong>Score disponible :</strong> " + self.props.score + " points" +
               "</div>" +
               "<div class='grillesIndices'>" +
                  "<p class='title'>Deux types d'indices sont disponibles :</p>" +
                  "<div class='blocGrilleIndices'>" + 
                     "<span>Révéler une case : " + getQueryCost({ type: "grid"}) + " points</span>" +
                     renderGrid() +
                  "</div>" +
                  "<div class='blocGrilleIndices'>" +
                     "<span>Révéler la position d'une lettre : " + getQueryCost({ type: "alphabet"}) + " points</span>" +
                     renderAlphabet() +
                  "</div>" +
               "</div>" +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById(self.name).innerHTML = renderTool();
   };

   return self;
}
