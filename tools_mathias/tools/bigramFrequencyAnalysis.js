function getBigramFrequencyAnalysis() {
   var self = {};

   self.name = "bigramFrequencyAnalysis";

   var sampleSubstitutionModified = playFair.getSampleSubstitution();
   sampleSubstitutionModified[10][9] = {
      src1: { l: 10, q:"confirmed" },
      src2: { l: 0, q:"confirmed" },
      dst1: { q:"unknown" },
      dst2: { l: 21, q:"confirmed" }
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
   self.letterRanks = bigramsUtils.getLetterRanks(playFair.alphabet);

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
                        "<input type='text' style='width:30px' value='" + common.getCellLetter(self.props.alphabet, substPair.dst1) + "'>" +
                     "</td>" +
                     "<td style='text-align:center'>" +
                        "<input type='text' style='width:30px' value='" + common.getCellLetter(self.props.alphabet, substPair.dst2) + "'>" +
                     "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Bloquer / débloquer :</strong></td>" +
                     "<td style='text-align:center'>" +
                        "<button type='button' class='locked'><i class='fa fa-lock'></i></button>" +
                     "</td>" +
                     "<td style='text-align:center'>" +
                        "<button type='button' class='locked'><i class='fa fa-lock'></i></button>" +
                     "</td>" +
                  "</tr>" +
               "</table>" +
               common.renderValidateOrCancelDialog(self.name) +
            "</div>";
      } else {
         return "";
      }
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
      return bigramsUtils.renderBigram(playFair.alphabet, substPair.dst1, substPair.dst2, side);
   }

   var conflictBetweenSubstitutions = function(bigram, substitution1, substitution2, side) {
      if ((substitution1 == undefined) || (substitution2 == undefined)) {
         return false;
      }
      var substPair1 = bigramsUtils.getBigramSubstPair(bigram.v, substitution1, self.letterRanks);
      var substPair2 = bigramsUtils.getBigramSubstPair(bigram.v, substitution2, self.letterRanks);
      var cell1 = substPair1["dst" + (side + 1)];
      var cell2 = substPair2["dst" + (side + 1)];
      if ((cell1.q == 'unknown') || (cell2.q == 'unknown')) {
         return false;
      }
      return (cell1.l != cell2.l);
   }

   self.clickBigram = function(iBigram) {
      self.state.editState = "preparing";
      self.state.edit = {
         iBigram: iBigram
      }
      self.render();
   };

   var renderBigram = function(bigram, side) {
       var html = "<div style='border: solid black 1px;margin:4px;width:30px;text-align:center;background-color:white'>";
       if ((side == undefined) || (side == 0)) {
          html += bigram.v.charAt(0);
       }
       if (side == undefined) {
          html += "&nbsp;";
       }
       if ((side == undefined) || (side == 1)) {
          html += bigram.v.charAt(1);
       }
       html += "</div>";
       return html;
   }

   var renderBigrams = function(bigrams, initialSubstitution, newSubstitution) {
      var bigramsHtml = "";
      for (var iBigram = 0; iBigram < bigrams.length; iBigram++) {
         var bigram = bigrams[iBigram];
         var bigramClass = "";
         if ((initialSubstitution != undefined) && (self.state.edit != undefined) && (self.state.edit.iBigram == iBigram)) {
            bigramClass = "selectedBigram";
         }
         bigramsHtml += "<div style='display:inline-block;margin:5px;'>" +
            bigram.r + "%<br/>" +
            "<div onclick='" + self.name + ".clickBigram(" + iBigram + ")' class='" + bigramClass +"'>" +
               renderBigram(bigram);
         if (initialSubstitution != undefined) {
            for (var side = 0; side < 2; side++) {
               var sideClass = "";
               if (conflictBetweenSubstitutions(bigram, initialSubstitution, newSubstitution, side)) {
                  sideClass = "substitutionConflict";
               }
               bigramsHtml += "<div class='" + sideClass + "' style='display:inline-block'>" +
                     renderBigramSubst(bigram, initialSubstitution, side) + "<br/>" +
                     renderBigramSubst(bigram, newSubstitution, side) +
                  "</div>";
            }
         }
         bigramsHtml += "</div>" +
            "</div>";
      }
      var html = "<div style='overflow-x:scroll;white-space:nowrap;border:solid black 1px;margin:5px;width:auto'>"+
         "<div style='display:inline-block;padding-right:5px;vertical-align:top'>" +
            "Fréquences&nbsp;:<br/>" +
            "Bigrammes&nbsp;:<br/><br/>";
      if (initialSubstitution != undefined) {
         html += "Substitution d'origine&nbsp;:<br/><br/>";
      }
      if (newSubstitution != undefined) {
         html += "Nouvelle substitution&nbsp;:<br/>";
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
                  renderBigrams(bigramsUtils.mostFrequentFrench); +
               "</div>" +
               "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById(self.name).innerHTML = renderTool();
   }

   return self;
}
