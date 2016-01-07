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
      inputSubstitutionVariable: "substitutionFréquences",
      outputSubstitutionVariable: "substitutionAméliorée"
   };

   self.state = {
      scrollTop: 0,
      textBigrams: undefined,
      editedSubstitution: [],
      editState: undefined,
      edit: undefined
   };

   self.letterRanks = common.getLetterRanks(playFair.alphabet);
   var letterInfos = bigramsUtils.getTextAsBigrams(self.props.inputCipheredText, self.props.alphabet).letterInfos;

   self.compute = function() {
      self.props.outputSubstitution = bigramsUtils.updateSubstitution(self.props.alphabet, self.props.inputSubstitution, self.state.editedSubstitution);
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
         var btnToggleClass = [];
         for (var iLetter = 0; iLetter < 2; iLetter++) {
            buttonLockedClass[iLetter] = "";
            if (self.state.edit.locked[iLetter]) {
               buttonLockedClass[iLetter] = "locked";
               btnToggleClass[iLetter] = "fa-toggle-on";
            }
            else btnToggleClass[iLetter] = "fa-toggle-off";
         }
         return "<div class='dialog'>" +
                  "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Bigramme édité :</span>" +
                     "<span class='dialogBigram bigramCipheredLetter'>" +
                        "<span class='bigramLetter'>" + renderBigram(bigram, 0) + "</span>" +
                        "<span class='bigramLetter'>" + renderBigram(bigram, 1) + "</span>" +
                     "</span>" +
                  "</div>" +
                  "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Substitution d'origine :</span>" +
                     "<span class='dialogBigram dialogBigramSubstOrig'>" +
                        renderBigramSubst(bigram, self.props.inputSubstitution, 0) +
                        renderBigramSubst(bigram, self.props.inputSubstitution, 1) +
                     "</span>" +
                  "</div>" +
                  "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Nouvelle substitution :</span>" +
                     "<span class='dialogLetterSubst'>" +
                        "<input id='editBigramCellLetter1' onchange='" + self.name + ".changeCellLetter(0)' type='text' value='" + self.state.edit.letters[0] + "'>" +
                     "</span>" +
                     "<span class='dialogLetterSubst'>" +
                        "<input id='editBigramCellLetter2' onchange='" + self.name + ".changeCellLetter(1)'  type='text' value='" + self.state.edit.letters[1] + "'>" +
                     "</span>" +
                  "</div>" +
                  "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>&nbsp;</span>" +
                     "<span class='substitutionLock'>" + common.renderLock(self.state.edit.locked[0]) + "</span>" +
                     "<span class='substitutionLock'>" + common.renderLock(self.state.edit.locked[1]) + "</span>" +
                  "</div>" +
                  "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Bloquer / débloquer : <i class='fa fa-question-circle'  data-toggle='tooltip' data-placement='top' title='Aide contextuelle'></i></span>" +
                     "<span>" +
                        "<button type='button' onclick='" + self.name + ".toggleLockLetter(0)' class='btn-toggle lock " + buttonLockedClass[0] + "'><i class='fa "+ btnToggleClass[0] + "'></i></button>" +
                     "</span>" +
                     "<span>" +
                        "<button type='button' onclick='" + self.name + ".toggleLockLetter(1)' class='btn-toggle lock " + buttonLockedClass[1] + "'><i class='fa "+ btnToggleClass[1] +"'></i></button>" +
                     "</span>" +
                  "</div>" +
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
      renderAll();
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
         var cell = substPair.dst[iLetter]
         if (letters[iLetter] != "") {
            cell.l = letterRanks[letters[iLetter]];
            cell.q = "guess";
            if (self.state.edit.locked[iLetter]) {
               cell.q = "locked";
            }
         } else {
            cell.q = "unknown";
            cell.l = undefined;
         }
      }
      var rank1 = letterRanks[bigram.charAt(0)];
      var rank2 = letterRanks[bigram.charAt(1)];
      if (self.state.editedSubstitution[rank1] == undefined) {
         self.state.editedSubstitution[rank1] = [];
      }
      self.state.editedSubstitution[rank1][rank2] = substPair;

      self.cancelDialog();
   }

   self.cancelDialog = function() {
      self.state.edit = undefined;
      self.state.editState = undefined;
      renderAll();
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
      saveScroll();
      self.state.editState = "preparing";
      var bigram = letterInfos[iLetter].bigram;
      if (bigram == undefined) {
         return;
      }
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
      renderAll();
   };

   var renderBigram = function(bigram, side) {
       var html = "";
       if ((side == undefined) || (side == 0)) {
          html += bigram.charAt(0);
       }
       if (side == undefined) {
          html += "&nbsp;";
       }
       if ((side == undefined) || (side == 1)) {
          html += bigram.charAt(1);
       }
       return html;
   };

   var renderBigrams = function(initialSubstitution, newSubstitution) {
      var nbLettersPerRow = 29;
      var text = self.props.inputCipheredText;
      var lineStartCols = common.getWrappingInfos(text, nbLettersPerRow, self.props.alphabet);
      var html = "<div id='" + self.name + "-scrollBlock' class='y-scrollBloc'>";
      var line = 0;
      for (var iLetter = 0; iLetter < text.length; iLetter++) {
         if (lineStartCols[line + 1] == iLetter) {
            html += "<hr />";
            line++;
         }
         var letter = text.charAt(iLetter);
         var bigram = letterInfos[iLetter].bigram;
         var status = letterInfos[iLetter].status;
         var iBigram = letterInfos[iLetter].iBigram;
         var bigramClass = "";
         if ((initialSubstitution != undefined) && (self.state.edit != undefined) && (self.state.edit.iBigram == iBigram)) {
            bigramClass = "selectedBigram";
         }
         html += "<div class='letterSubstBloc letterStatus-" + status + " " + bigramClass + "' onclick='" + self.name + ".clickLetter(" + iLetter + "," + iBigram + ")'>" +
               "<div class='cipheredLetter'>" +letter + "</div>";
         if ((status == "left") || (status == "right")) {
            var side = 0;
            if (status == "right") {
               side = 1;
            }
            var sideClass = "";
            if (bigramsUtils.conflictBetweenSubstitutions({ v: bigram }, initialSubstitution, newSubstitution, side, self.letterRanks)) {
               sideClass = "substitutionConflict";
            }
            var substPair = bigramsUtils.getBigramSubstPair(bigram, self.props.outputSubstitution, self.letterRanks);
            if (status == "left") {
               html += "<div class='substitutionPair " + sideClass + "'>";
               html += "<span class='originLetter'>" + renderBigramSubst(bigram, initialSubstitution, 0) + "</span>";
               html += "<span class='newLetter'>" + renderBigramSubst(bigram, newSubstitution, 0) + "</span>";
               html += "<span class='substitutionLock'>" + common.renderLock(substPair.dst[0].q == "locked") + "</span>";
               html += "</div>";
            } else if (status == "right") {
               html += "<div class='substitutionPair " + sideClass + "'>";
               html += "<span class='originLetter'>" + renderBigramSubst(bigram, initialSubstitution, 1) + "</span>";
               html += "<span class='newLetter'>" + renderBigramSubst(bigram, newSubstitution, 1) + "</span>";
               html += "<span class='substitutionLock'>" + common.renderLock(substPair.dst[1].q == "locked") + "</span>";
               html += "</div>";
            }
         } else {
            html += "<div class='substitutionPair'>";
            html += "<div class='character'>" +letter + "</div>";
            html += "<div class='character'>" +letter + "</div>";
            html += "<div class='character'> </div>";
            html += "</div>";
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
                  "<p><strong>Nombre de conflits entre les substitutions :</strong> " + bigramsUtils.countAllSubstitutionConflicts(self.props.inputSubstitution, self.props.outputSubstitution, self.props.alphabet, self.letterRanks) + "</p>" +
                  renderBigrams(self.props.inputSubstitution, self.props.outputSubstitution) +
               "</div>" +
            "</div>" +
         "</div>";
   };

   var saveScroll = function() {
      var div = document.getElementById(self.name + "-scrollBlock");
      self.state.scrollTop = div.scrollTop;
   }
   
   var restoreScroll = function() {
      var div = document.getElementById(self.name + "-scrollBlock");
      div.scrollTop = self.state.scrollTop;
   }

   self.render = function() {
      self.compute();
      document.getElementById(self.name).innerHTML = renderTool();
      restoreScroll();
   }

   return self;
}
