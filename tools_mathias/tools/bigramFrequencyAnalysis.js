function getBigramFrequencyAnalysis() {
   var self = {};

   self.name = "bigramFrequencyAnalysis";

   var sampleSubstitutionModified = playFair.getSampleSubstitution();
   sampleSubstitutionModified[10][9] = {
      src: [{ l: 10, q:"confirmed" }, { l: 0, q:"confirmed" }],
      dst: [{ q:"unknown" }, { l: 21, q:"locked" }]
   }

   self.props = {
      alphabet: playFair.alphabet,      
      frenchBigrams: bigramsUtils.mostFrequentFrench,
      inputCipheredText: playFair.sampleCipheredText,
      inputSubstitution: [],
      outputSubstitution: [], //sampleSubstitutionModified,
      inputCipheredTextVariable: "texteChiffré",
      inputSubstitutionVariable: "substitutionDépart",
      outputSubstitutionVariable: "substitutionFréquences"
   };

   self.state = {
      textBigrams: undefined,
      editState: undefined,
      edit: undefined,
      editedSubstitution: [],
      scrollLeftText: 0,
      scrollLeftFrench: 0
   };

   self.mostFrequentBigrams = bigramsUtils.getMostFrequentBigrams(self.props.inputCipheredText, self.props.alphabet);
   self.letterRanks = common.getLetterRanks(playFair.alphabet);

   self.compute = function() {
      self.props.outputSubstitution = bigramsUtils.updateSubstitution(self.props.alphabet, self.props.inputSubstitution, self.state.editedSubstitution);
   };

   var renderInstructionPython = function() {
      return "<span class='code-var'>" + self.props.outputSubstitutionVariable + "</span> = analyseFrequenceBigrammes(" +
         self.props.inputCipheredTextVariable + ", " +
         self.props.inputSubstitutionVariable + ", " +
         "..." +
         ")"
   };
   
   var renderEditCell = function() {
      if (self.state.editState == "preparing") {
         var bigram = self.mostFrequentBigrams[self.state.edit.iBigram];
         var substPair = bigramsUtils.getBigramSubstPair(bigram.v, self.props.inputSubstitution, self.letterRanks);
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
                        "<span class='bigramLetter'>" +
                        renderBigram(bigram, 0) +
                        "</span>" +
                        "<span class='bigramLetter'>" +
                        renderBigram(bigram, 1) +
                        "</span>" +
                     "</span>" +
                  "</div>" +
                  "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Substitution d'origine :</span>" +
                     "<span class='dialogBigram dialogBigramSubstOrig'>" + renderBigramSubst(bigram, self.props.inputSubstitution, 0) +
                        renderBigramSubst(bigram, self.props.inputSubstitution, 1) +
                     "</span>" +
                  "</div>" +
                  "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Nouvelle substitution :</span>" +
                     "<span class='dialogLetterSubst'>" +
                        "<input id='editBigramSubstLetter1' onchange='" + self.name + ".changeBigramSubstLetter(0)' type='text' value='" + self.state.edit.letters[0] + "'>" +
                     "</span>" +
                     "<span class='dialogLetterSubst'>" +
                        "<input id='editBigramSubstLetter2' onchange='" + self.name + ".changeBigramSubstLetter(1)'  type='text' value='" + self.state.edit.letters[1] + "'>" +
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
                        "<button type='button' onclick='" + self.name + ".toggleLockLetter(0)' class='btn-toggle lock " + buttonLockedClass[0] + "'><i class='fa "+ btnToggleClass[0] +"'></i></button>" +
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

   self.changeBigramSubstLetter = function(iLetter) {
      var letter = document.getElementById("editBigramSubstLetter" + (iLetter + 1)).value;
      self.state.edit.letters[iLetter] = letter;
   };

   self.validateDialog = function() {
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
      var bigram = self.mostFrequentBigrams[self.state.edit.iBigram];
      var substPair = self.state.edit.substPair;
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
      var rank1 = letterRanks[bigram.v.charAt(0)];
      var rank2 = letterRanks[bigram.v.charAt(1)];
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
//            {label: "Nouvelle subsitution", name: self.props.outputSubstitutionVariable}
         ]
      });
   };

   var renderBigramSubst = function(bigram, substitution, side) {
      if (substitution == undefined) {
         return "";
      }
      var substPair = bigramsUtils.getBigramSubstPair(bigram.v, substitution, self.letterRanks);
      return bigramsUtils.renderBigram(playFair.alphabet, substPair.dst[0], substPair.dst[1], side);
   };

   self.clickBigram = function(iBigram) {
      saveScroll();
      self.state.editState = "preparing";
      var bigram = self.mostFrequentBigrams[iBigram];
      var substPair = bigramsUtils.getBigramSubstPair(bigram.v, self.props.outputSubstitution, self.letterRanks);
      self.state.edit = {
         iBigram: iBigram,
         locked: [
            (substPair.dst[0].q == "locked"),
            (substPair.dst[1].q == "locked")
         ],
         letters: [
            common.getCellLetter(self.props.alphabet, substPair.dst[0]),
            common.getCellLetter(self.props.alphabet, substPair.dst[1])
         ],
         substPair: substPair
      }
      renderAll();
   };

   self.toggleLockLetter = function(iLetter) {
      self.state.edit.locked[iLetter] = !self.state.edit.locked[iLetter];
      renderAll();
   };

   var renderBigram = function(bigram, side) {
       var html = "";
       if ((side == undefined) || (side == 0)) {
          html += bigram.v.charAt(0);
       }
       if (side == undefined) {
          html += "&nbsp;";
       }
       if ((side == undefined) || (side == 1)) {
          html += bigram.v.charAt(1);
       }
       return html;
   };

   var renderBigrams = function(scrollDivID, bigrams, initialSubstitution, newSubstitution) {
      var bigramsHtml = "";
      for (var iBigram = 0; iBigram < bigrams.length; iBigram++) {
         var bigram = bigrams[iBigram];
         var substPair = bigramsUtils.getBigramSubstPair(bigram.v, self.props.outputSubstitution, self.letterRanks);
         var bigramClass = "";
         if ((initialSubstitution != undefined) && (self.state.edit != undefined) && (self.state.edit.iBigram == iBigram)) {
            bigramClass = "selectedBigram";
         }
         var clickBigram = "";
/*         if (initialSubstitution != undefined) {
            clickBigram = "onclick='" + self.name + ".clickBigram(" + iBigram + ")'";
         }
*/
         bigramsHtml += "<div class='bigramBloc'>" +
            "<span class='frequence'>" + bigram.r + "%</span>" +
            "<div " + clickBigram + " class='bigramBlocSubstitution " + bigramClass +"'>" +
               "<div class='bigramCipheredLetter'><span>" +
               renderBigram(bigram) +
               "</span></div>";
         if (initialSubstitution != undefined) {
            for (var side = 0; side < 2; side++) {
               var sideClass = "";
/*
               if (bigramsUtils.conflictBetweenSubstitutions(bigram, initialSubstitution, newSubstitution, side, self.letterRanks)) {
                  sideClass = "substitutionConflict";
               }
               var lock = "&nbsp;";
               if (substPair.dst[side].q == "locked") {
                  lock = "<i class='fa fa-lock'></i>";
               }
*/
               bigramsHtml += "<div class='substitutionPair " + sideClass + "'>" +
                     "<span class='originLetter'>" +
                        renderBigramSubst(bigram, initialSubstitution, side) +
                     "</span>" +
/*                     "<span class='newLetter'>" +
                        renderBigramSubst(bigram, newSubstitution, side) +
                     "</span>" +
                     "<span class='substitutionLock'>" + lock + "</span>" +
*/
                  "</div>";
            }
         }
         bigramsHtml += "</div>" +
            "</div>";
      }
      var html = "<div id='" + scrollDivID + "' class='x-scrollBloc'>"+
         "<div class='labels'>" +
            "<div>Fréquences&nbsp;:</div>" +
            "<div>Bigrammes&nbsp;:</div>";
      if (initialSubstitution != undefined) {
         html += "<div>Substitution proposée&nbsp;:</div>";
      }
/*    if (newSubstitution != undefined) {
         html += "<div>Nouvelle substitution&nbsp;:</div>";
      }
*/
      html += "</div>" +
         bigramsHtml +
      "</div>";
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
               "<div class='grillesSection'>" +
                  "<strong>Nombre de conflits :</strong> " + bigramsUtils.countSubstitutionConflicts(self.mostFrequentBigrams, self.props.inputSubstitution, self.props.outputSubstitution, self.letterRanks) + "<br/>" +
                  "<strong>Bigrammes les plus fréquents du texte d'entrée :</strong>" +
                  renderBigrams(self.name + "-scrollText", self.mostFrequentBigrams, self.props.inputSubstitution, self.props.outputSubstitution) +
                  "<strong>Bigrammes les plus fréquents en français :</strong>" +
                  renderBigrams(self.name + "-scrollFrench", bigramsUtils.mostFrequentFrench) +
               "</div>" +
            "</div>" +
         "</div>";
   };

   var saveScroll = function() {
      var divText = document.getElementById(self.name + "-scrollText");
      self.state.scrollLeftText = divText.scrollLeft;
      var divFrench = document.getElementById(self.name + "-scrollFrench");
      self.state.scrollLeftFrench = divFrench.scrollLeft;
   }

   var restoreScroll = function() {
      var divText = document.getElementById(self.name + "-scrollText");
      divText.scrollLeft = self.state.scrollLeftText;
      var divFrench = document.getElementById(self.name + "-scrollFrench");
      divFrench.scrollLeft = self.state.scrollLeftFrench;
   }

   self.render = function() {
      self.compute();
      document.getElementById(self.name).innerHTML = renderTool();
      restoreScroll();
   }

   return self;
}
