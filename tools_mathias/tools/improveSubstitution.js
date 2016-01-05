function getImproveSubstitution() {
   var self = {};

   self.name = "improveSubstitution";

   var sampleSubstitutionModified = playFair.getSampleSubstitution();
   sampleSubstitutionModified[10][9] = {
      src: [{ l: 10, q:"confirmed" }, { l: 0, q:"confirmed" }],
      dst: [{ q:"unknown" }, { l: 21, q:"confirmed" }]
   }

   
   self.props = {
      alphabet: playFair.alphabet,      
      frenchBigrams: bigramsUtils.mostFrequentFrench,
      inputCipheredText: playFair.sampleCipheredText,
      inputSubstitution: playFair.getSampleSubstitution(),
      outputSubstitution: [], //sampleSubstitutionModified,
      inputCipheredTextVariable: "texteChiffré",
      inputSubstitutionVariable: "substitution",
      outputSubstitutionVariable: "nouvelleSubstitution"
   };

   self.state = {
      textBigrams: undefined,
      editState: undefined,
      edit: undefined
   };

   self.letterRanks = common.getLetterRanks(playFair.alphabet);
   var letterInfos = bigramsUtils.getTextAsBigrams(self.props.inputCipheredText, self.props.alphabet).letterInfos;

   self.compute = function() {
      bigramsUtils.updateSubstitution(self.props.inputSubstitution, self.props.outputSubstitution);
   };

   var renderInstructionPython = function() {
      return "<span class='code-var'>" + self.props.outputSubstitutionVariable + "</span> = amelioreSubstitution(" +
         self.props.inputCipheredTextVariable + ", " +
         self.props.inputSubstitutionVariable + ", " +
         "..." +
         ")";
   };
   
   var renderEditCell = function() {
      if (self.state.editState == "preparing") {
         var bigram = letterInfos[self.state.edit.iLetter].bigram;
         var substPair = bigramsUtils.getBigramSubstPair(bigram, self.props.inputSubstitution, self.letterRanks);
         var buttonLockedClass = [];
         for (var iLetter = 0; iLetter < 2; iLetter++) {
            buttonLockedClass[iLetter] = "";
            if (self.state.edit.locked[iLetter]) {
               buttonLockedClass[iLetter] = "locked";
            }
         }
         return "<div class='dialog'>" +
               "<table>" +
                  "<tr>" +
                     "<td><strong>Bigramme édité :</strong></td>" +
                     "<td>" + renderBigram(bigram, 0) + "</td>" +
                     "<td>" + renderBigram(bigram, 1) + "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Substitution d'origine :</strong></td>" +
                     "<td style='text-align:center'>" + renderBigramSubst(bigram, self.props.inputSubstitution, 0) + "</td>" +
                     "<td style='text-align:center'>" + renderBigramSubst(bigram, self.props.inputSubstitution, 1) + "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Nouvelle substitution :</strong></td>" +
                     "<td style='text-align:center'>" + 
                        "<input id='editBigramCellLetter1' type='text' style='width:30px' onchange='" + self.name + ".changeCellLetter(0)' value='" + self.state.edit.letters[0] + "'>" +
                     "</td>" +
                     "<td style='text-align:center'>" +
                        "<input id='editBigramCellLetter2' type='text' style='width:30px' onchange='" + self.name + ".changeCellLetter(1)' value='" + self.state.edit.letters[1] + "'>" +
                     "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td></td>" +
                     "<td style='text-align:center'>" +
                        "<span class='substitutionLock'>" + common.renderLock(self.state.edit.locked[0]) + "</span>" +
                     "</td>" +
                     "<td style='text-align:center'>" +
                        "<span class='substitutionLock'>" + common.renderLock(self.state.edit.locked[1]) + "</span>" +
                     "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Bloquer / débloquer :</strong></td>" +
                     "<td style='text-align:center'>" +
                        "<button type='button' onclick='" + self.name + ".toggleLockLetter(0)' class='" + buttonLockedClass[0] + "'><i class='fa fa-lock'></i></button>" +
                     "</td>" +
                     "<td style='text-align:center'>" +
                        "<button type='button' onclick='" + self.name + ".toggleLockLetter(1)' class='" + buttonLockedClass[1] + "'><i class='fa fa-lock'></i></button>" +
                     "</td>" +
                  "</tr>" +
               "</table>" +
               common.renderValidateOrCancelDialog(self.name) +
            "</div>";
      } else {
         return "";
      }
   };

   self.changeCellLetter = function(iLetter) {
      self.state.edit.letters[iLetter] = document.getElementById("editBigramCellLetter" + (iLetter + 1)).value;
   };

   self.toggleLockLetter = function(iLetter) {
      self.state.edit.locked[iLetter] = !self.state.edit.locked[iLetter];
      self.render();
   };

   self.validateDialog = function() {
      // TODO : factor with validateDialog from bigramFrequencyAnalysis
      var letterRanks = common.getLetterRanks(playFair.alphabet);
      // TODO: get from state and store in state on change
      var letters = self.state.edit.letters;
      for (var iLetter = 0; iLetter < 2; iLetter++) {
         var letter = letters[iLetter];
         if ((letter != '') && (letterRanks[letter] == undefined)) {
            alert(letter + " n'est pas une valeur possible de la grille");
            return;
         }
      }
      var bigram = letterInfos[self.state.edit.iLetter].bigram;
      var substPair = bigramsUtils.getBigramSubstPair(bigram, self.props.outputSubstitution, self.letterRanks);
      for (var iLetter = 0; iLetter < 2; iLetter++) {
         if (letters[iLetter] != "") {
            var cell = substPair.dst[iLetter]
            cell.l = letterRanks[letters[iLetter]];
            cell.q = "guess";
            if (self.state.edit.locked[iLetter]) {
               cell.q = "locked";
            }
         }
      }
      var rank1 = letterRanks[bigram.charAt(0)];
      var rank2 = letterRanks[bigram.charAt(1)];
      if (self.props.outputSubstitution[rank1] == undefined) {
         self.props.outputSubstitution[rank1] = [];
      }
      self.props.outputSubstitution[rank1][rank2] = substPair;

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
            {label: "Texte chiffré analysé", name: self.props.inputCipheredTextVariable},
            {label: "Substitution d'origine", name: self.props.inputSubstitutionVariable}
         ],
         output: [
            {label: "Nouvelle subsitution", name: self.props.outputSubstitutionVariable}
         ]
      });
   };

   var renderBigramSubst = function(bigram, substitution, side) {
      if (substitution == undefined) {
         return "";
      }
      var substPair = bigramsUtils.getBigramSubstPair(bigram, substitution, self.letterRanks);
      return bigramsUtils.renderBigram(playFair.alphabet, substPair.dst[0], substPair.dst[1], side);
   }

   self.clickLetter = function(iLetter, iBigram) {
      self.state.editState = "preparing";
      var bigram = letterInfos[iLetter].bigram;
      var substPair = bigramsUtils.getBigramSubstPair(bigram, self.props.outputSubstitution, self.letterRanks);
      self.state.edit = {
         iLetter: iLetter,
         iBigram: iBigram,
         letters: [
            common.getCellLetter(self.props.alphabet, substPair.dst[0]),
            common.getCellLetter(self.props.alphabet, substPair.dst[1])
         ],
         locked: [
            (substPair.dst[0].q == "locked"),
            (substPair.dst[1].q == "locked")
         ]
      }
      self.render();
   };

   var renderBigram = function(bigram, side) {
       var html = "<div style='border: solid black 1px;margin:4px;width:30px;text-align:center;background-color:white'>";
       if ((side == undefined) || (side == 0)) {
          html += bigram.charAt(0);
       }
       if (side == undefined) {
          html += "&nbsp;";
       }
       if ((side == undefined) || (side == 1)) {
          html += bigram.charAt(1);
       }
       html += "</div>";
       return html;
   };

   var renderBigrams = function(initialSubstitution, newSubstitution) {
      var nbLettersPerRow = 27;
      var text = self.props.inputCipheredText;
      var html = "<div class='y-scrollBloc'>";
      for (var iLetter = 0; iLetter < text.length; iLetter++) {
         if ((iLetter != 0) && (iLetter % nbLettersPerRow == 0)) {
            html += "<hr />";
         }
         var letter = text.charAt(iLetter);
         var bigram = letterInfos[iLetter].bigram;
         var status = letterInfos[iLetter].status;
         var iBigram = letterInfos[iLetter].iBigram;
         var bigramClass = "";
         if ((initialSubstitution != undefined) && (self.state.edit != undefined) && (self.state.edit.iBigram == iBigram)) {
            bigramClass = "selectedBigram";
         }
         html += "<div class='letterSubstBloc letterStatus-" + status + " " + bigramClass +"' onclick='" + self.name + ".clickLetter(" + iLetter + "," + iBigram + ")'>" +
               "<div class='cipheredLetter'>" +letter + "</div>";
         if ((status == "left") || (status == "right")) {
            var substPair = bigramsUtils.getBigramSubstPair(bigram, self.props.outputSubstitution, self.letterRanks);
            if (status == "left") {
               html += renderBigramSubst(bigram, initialSubstitution, 0);
               html += renderBigramSubst(bigram, newSubstitution, 0);               
               html += "<span class='substitutionLock'>" + common.renderLock(substPair.dst[0].q == "locked") + "</span>";
            } else if (status == "right") {
               html += renderBigramSubst(bigram, initialSubstitution, 1);
               html += renderBigramSubst(bigram, newSubstitution, 1);
               html += "<span class='substitutionLock'>" + common.renderLock(substPair.dst[1].q == "locked") + "</span>";
            }
         } else {
            html += "<div class='character'>" +letter + "</div>";
            html += "<div class='character'>" +letter + "</div>";
            html += "<div class='character'> </div>";
         }
         html += "</div>";
      }
      html += "</div>";
      return html;
   }

   var renderTool = function() {
      return "<div class='panel panel-default'>" +
            "<div class='panel-heading'><span class='code'>" +
               renderInstructionPython() +
            "</span></div>" +
            "<div class='panel-body'>" +
               renderEditCell() +
               renderVariables() +
               "<br/><br/>" + // TODO : with css ?
               "<div class='grillesSection'>" +
                  "<strong>Bigrammes en conflit :</strong> " + "TODO" + "<br/>" +
                  renderBigrams(self.props.inputSubstitution, self.props.outputSubstitution) +
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
