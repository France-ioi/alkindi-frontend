function getHintsPlayFair() {
   var self = {};
   
   self.name = "hintsPlayFair";

   self.state = {
      alphabet: playFair.alphabet,
      inputGridCells: playFair.sampleGrid,
      score: 470,
      hintQuery: { type:'grid', row: 2, col: 3 },
      hintValues: [[],[,0],[],[,,,4],[]],
      hintState: "preparing",
      outputGridVariable: "lettresGrilleIndice"
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
      return self.state.outputGridVariable + " = " + getGridPython(self.state.inputGridCells, getCellPython);
   };
   
   var getGridHtml = function() {
      return playFair.getGridHtml(self, getCellLetter);
   };

   self.clickGridCell = function(iRow, iCol) {
      if (self.state.hintState === "waiting") {
         return;
      }
      if (self.state.inputGridCells[iRow][iCol].q === "confirmed") {
         self.cancelHint();
      } else {
         self.state.hintQuery = { type:'grid', row: iRow, col: iCol };
         self.state.hintState === "preparing"
      }
      self.render();
   };
   
   self.clickGridAlphabet = function(rank) {
      if (self.state.hintState === "waiting") {
         return;
      }
      var qualifiers = getLetterQualifiersFromGrid(self.state.inputGridCells, self.state.alphabet);
      if (qualifiers[rank] === "confirmed") {
         self.cancelHint();
      } else {
         self.state.hintQuery = { type:'alphabet', rank: rank };
         self.state.hintState === "preparing"
      }
      self.render();
   };
   
   var getAlphabetHtml = function() {
      var qualifiers = getLetterQualifiersFromGrid(self.state.inputGridCells, self.state.alphabet);
      var strHtml = "";

      for (var iRow = 0; iRow < 2; iRow++) {
         strHtml += "<table class='playFairAlphabet'>";
         strHtml += "<tr>";
         for (var iCol = 0; iCol < 13; iCol++) {
            var letterRank = iRow * 13 + iCol;
            if (letterRank == 22) {
               strHtml += "<td class='qualifier-disabled'></td>";
            } else {
               if (letterRank > 22) { // no W
                  letterRank--;
               }
               var queryClass = "";
               var query = self.state.hintQuery;
               if (query !== null) {
                  if ((query.type === 'alphabet') && (query.rank === letterRank)) {
                     queryClass = "cell-query";
                  }
               }
               strHtml += "<td class='" + queryClass + " qualifier-" + qualifiers[letterRank] + "' onClick='" + self.name + ".clickGridAlphabet(" + letterRank + ")'>" +
                  self.state.alphabet[letterRank] +
                  "</td>";
            }
         }
         strHtml += "</tr>";
         strHtml += "</table>";
         if (iRow == 0) {
            strHtml += "<br/>";
         }
      }
      return strHtml;
   };

   var getQueryCost = function(query) {
      if (query.type === "grid") {
         return 15;
      } else {
         return 10;
      }
   }

   var getHintQueryHtml = function() {
      if (self.state.hintQuery === null) {
         return "";
      } else if (self.state.hintState === "preparing") {
         var query = self.state.hintQuery;
         var message;
         if (query.type === "grid") {
            message = "lettre à la ligne " + (query.row + 1) + ", colonne " + (query.col + 1) + " de la grille.";
         } else {
            message = "position de la lettre " + self.state.alphabet[query.rank] + " dans la grille";
         }
         var cost = getQueryCost(query);
         return "<div class='dialog'>" +
               "<strong>Indice demandé :</strong> " + message + "<br/>" +
               "<strong>Coût :</strong> " + cost + " points<br/>" +
               "<div style='text-align:center'>" +
               "<button onclick='hintsPlayFair.validateHint()'>Valider</button>" +
               "&nbsp;&nbsp;&nbsp;" +
               "<button onclick='hintsPlayFair.cancelHint()'>Annuler</button>" +
               "</div>" +
            "</div>";
      } else if (self.state.hintState === "waiting") {
         return "<div class='hintQuery'>En attente de réponse du serveur</div>";
      } else if (self.state.hintState === "received") {
         return "<div class='hintQuery'>Indice obtenu <button onclick='hintsPlayFair.cancelHint()'>OK</button></div>";
      }
   };

   self.cancelHint = function() {
      self.state.hintQuery = null;
      self.state.hintState = "idling";
      self.render();
   };

   self.validateHint = function() {
      self.state.hintState = "waiting";
      self.render();
      setTimeout(function() {
         self.state.hintState = "received";
         self.render();
      }, 1000);
   };

   var getVariables = function() {
      return getVariablesHtml([
         {label: "Grille enregistrée", name: self.state.outputGridVariable}
      ]);
   };

   var getToolHtml = function() {
      return "<div style='width:700px;border: solid black 1px'>" +
            "<div style='width:100%;border: solid black 1px;box-sizing: border-box;padding:3px'>" + 
               getInstructionPython() +
            "</div>" +
            "<div style='overflow:auto'>" +
               "<div style='float:right; margin:3px'>" + getHintQueryHtml() + "</div>" +
               getVariables() +
               "<strong>Score disponible :</strong> " + self.state.score + " points" +
            "</div>" +
            "<span style='clear:both'></span>" + 
            "<div style='display:inline-block;vertical-align:middle;margin:3px'>" + 
               "Révéler une case : " + getQueryCost({ type: "grid"}) + " points" +
               getGridHtml() +
            "</div>" +
            "<div style='display:inline-block;vertical-align:middle;padding-left:40px'>" +
               "Révéler la position d'une lettre : " + getQueryCost({ type: "alphabet"}) + " points" +
               getAlphabetHtml() +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById('hintsPlayFair').innerHTML = getToolHtml();
   };

   return self;
}
