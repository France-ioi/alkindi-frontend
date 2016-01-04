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
      inputSubstitution: playFair.getSampleSubstitution(),
      outputSubstitution: sampleSubstitutionModified,
      inputCipheredTextVariable: "texteChiffré",
      inputSubstitutionVariable: "substitution",
      outputSubstitutionVariable: "nouvelleSubstitution"
   };

   self.state = {
      textBigrams: undefined,
      editState: undefined,
      edit: undefined
   };

   self.mostFrequentBigrams = bigramsUtils.getMostFrequentBigrams(self.props.inputCipheredText, self.props.alphabet);
   self.letterRanks = common.getLetterRanks(playFair.alphabet);

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
         for (var iLetter = 0; iLetter < 2; iLetter++) {
            buttonLockedClass[iLetter] = "";
            if (self.state.edit.locked[iLetter]) {
               buttonLockedClass[iLetter] = "locked";
            }
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
                     "<span class='dialogBigramSubst'>" + 
                        "<input id='editBigramSubstLetter1' onchange='" + self.name + ".changeBigramSubstLetter(0)' type='text' value='" + self.state.edit.letters[0] + "'>" +
                     "</span>" +
                     "<span class='dialogBigramSubst'>" +
                        "<input id='editBigramSubstLetter2' onchange='" + self.name + ".changeBigramSubstLetter(1)'  type='text' value='" + self.state.edit.letters[1] + "'>" +
                     "</span>" +
                  "</div>" +
                  "<div class='dislogLine'>" +
                     "<span class='dialogLabel'>&nbsp;</span>" +
                     "<span class='substitutionLock'>" + common.renderLock(self.state.edit.locked[0]) + "</span>" +
                     "<span class='substitutionLock'>" + common.renderLock(self.state.edit.locked[1]) + "</span>" +
                  "</div>" +
                  "<div class='dialogLine'>" +
                     "<span class='dialogLabel'>Bloquer / débloquer : <i class='fa fa-info-circle'  data-toggle='tooltip' data-placement='top' title='Aide contextuelle'></i></span>" +
                     "<span>" +
                        "<button type='button' onclick='" + self.name + ".toggleLockLetter(0)' class='lock " + buttonLockedClass[0] + "'><i class='fa fa-lock'></i></button>" +
                     "</span>" +
                     "<span>" +
                        "<button type='button' onclick='" + self.name + ".toggleLockLetter(1)' class='lock " + buttonLockedClass[1] + "'><i class='fa fa-lock'></i></button>" +
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
         if (letters[iLetter] != "") {
            var cell = substPair.dst[iLetter]
            cell.l = letterRanks[letters[iLetter]];
            cell.q = "guess";
            if (self.state.edit.locked[iLetter]) {
               cell.q = "locked";
            }
         }
      }
      var rank1 = letterRanks[bigram.v.charAt(0)];
      var rank2 = letterRanks[bigram.v.charAt(1)];
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
      var substPair = bigramsUtils.getBigramSubstPair(bigram.v, substitution, self.letterRanks);
      return bigramsUtils.renderBigram(playFair.alphabet, substPair.dst[0], substPair.dst[1], side);
   }

   var conflictBetweenSubstitutions = function(bigram, substitution1, substitution2, side) {
      if ((substitution1 == undefined) || (substitution2 == undefined)) {
         return false;
      }
      var substPair1 = bigramsUtils.getBigramSubstPair(bigram.v, substitution1, self.letterRanks);
      var substPair2 = bigramsUtils.getBigramSubstPair(bigram.v, substitution2, self.letterRanks);
      var cell1 = substPair1.dst[side];
      var cell2 = substPair2.dst[side];
      if ((cell1.q == 'unknown') || (cell2.q == 'unknown')) {
         return false;
      }
      return (cell1.l != cell2.l);
   }

   self.clickBigram = function(iBigram) {
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
      self.render();
   };

   self.toggleLockLetter = function(iLetter) {
      self.state.edit.locked[iLetter] = !self.state.edit.locked[iLetter];
      self.render();
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
   }

   var renderBigrams = function(bigrams, initialSubstitution, newSubstitution) {
      var bigramsHtml = "";
      for (var iBigram = 0; iBigram < bigrams.length; iBigram++) {
         var bigram = bigrams[iBigram];
         var substPair = bigramsUtils.getBigramSubstPair(bigram.v, self.props.outputSubstitution, self.letterRanks);
         var bigramClass = "";
         if ((initialSubstitution != undefined) && (self.state.edit != undefined) && (self.state.edit.iBigram == iBigram)) {
            bigramClass = "selectedBigram";
         }
         bigramsHtml += "<div class='bigramBloc'>" +
            "<span class='frequence'>" + bigram.r + "%</span>" +
            "<div onclick='" + self.name + ".clickBigram(" + iBigram + ")' class='bigramBlocSubstitution " + bigramClass +"'>" +
               "<div class='bigramCipheredLetter'><span>" +
               renderBigram(bigram) +
               "</span></div>";
         if (initialSubstitution != undefined) {
            for (var side = 0; side < 2; side++) {
               var sideClass = "";
               if (conflictBetweenSubstitutions(bigram, initialSubstitution, newSubstitution, side)) {
                  sideClass = "substitutionConflict";
               }
               var lock = "&nbsp;";
               if (substPair.dst[side].q == "locked") {
                  lock = "<i class='fa fa-lock'></i>";
               }
               bigramsHtml += "<div class='substitutionPair " + sideClass + "'>" +
                     renderBigramSubst(bigram, initialSubstitution, side) +
                     renderBigramSubst(bigram, newSubstitution, side) +
                     "<span class='substitutionLock'>" + lock + "</span>" +
                  "</div>";
            }
         }
         bigramsHtml += "</div>" +
            "</div>";
      }
      var html = "<div class='x-scrollBloc'>"+
         "<div class='labels'>" +
            "<div>Fréquences&nbsp;:</div>" +
            "<div>Bigrammes&nbsp;:</div>";
      if (initialSubstitution != undefined) {
         html += "<div>Substitution d'origine&nbsp;:</div>";
      }
      if (newSubstitution != undefined) {
         html += "<div>Nouvelle substitution&nbsp;:</div>";
      }
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
                  "<strong>Bigrammes en conflit :</strong> " + "TODO" + "<br/>" +
                  "<strong>Bigrammes les plus fréquents du texte d'entrée :</strong>" +
                  renderBigrams(self.mostFrequentBigrams, self.props.inputSubstitution, self.props.outputSubstitution) +
                  "<strong>Bigrammes les plus fréquents en français :</strong>" +
                  renderBigrams(bigramsUtils.mostFrequentFrench) +
               "</div>" +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById(self.name).innerHTML = renderTool();
   }

   return self;
}
