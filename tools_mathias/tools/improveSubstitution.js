function getImproveSubstitution() {
   var self = {};

   self.name = "improveSubstitution";

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

   self.letterRanks = common.getLetterRanks(playFair.alphabet);
   var letterInfos = bigramsUtils.getTextAsBigrams(self.props.inputCipheredText, self.props.alphabet).letterInfos;

   var renderInstructionPython = function() {
      return "<span class='code-var'>" + self.props.outputSubstitutionVariable + "</span> = amelioreSubstitution(" +
         self.props.inputCipheredTextVariable + ", " +
         self.props.inputSubstitutionVariable + ", " +
         "..." +
         ")"
   };
   
   var renderEditCell = function() {
      if (self.state.editState == "preparing") {
         var bigram = letterInfos[self.state.edit.iLetter].bigram;
         var substPair = bigramsUtils.getBigramSubstPair(bigram, self.props.inputSubstitution, self.letterRanks);
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
      var substPair = bigramsUtils.getBigramSubstPair(bigram, substitution, self.letterRanks);
      return bigramsUtils.renderBigram(playFair.alphabet, substPair.dst1, substPair.dst2, side);
   }

   self.clickLetter = function(iLetter, iBigram) {
      self.state.editState = "preparing";
      self.state.edit = {
         iLetter: iLetter,
         iBigram: iBigram
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
   }

   var renderBigrams = function(initialSubstitution, newSubstitution) {
      var bigramsHtml = "";
      var nbLettersPerRow = 22;
      var text = self.props.inputCipheredText;
      var html = "<div style='overflow-y:scroll;white-space:nowrap;border:solid black 1px;margin:5px;width:auto;height:320px'>";
      for (var iLetter = 0; iLetter < text.length; iLetter++) {
         if ((iLetter != 0) && (iLetter % nbLettersPerRow == 0)) {
            html += "<br/>";
         }
         var letter = text.charAt(iLetter);
         var bigram = letterInfos[iLetter].bigram;
         var status = letterInfos[iLetter].status;
         var iBigram = letterInfos[iLetter].iBigram;
         var bigramClass = "";
         if ((initialSubstitution != undefined) && (self.state.edit != undefined) && (self.state.edit.iBigram == iBigram)) {
            bigramClass = "selectedBigram";
         }
         html += "<div style='display:inline-block;vertical-align:top;text-align:center;margin-top:5px;margin-bottom:5px'>" +
            "<div onclick='" + self.name + ".clickLetter(" + iLetter + "," + iBigram + ")' class='letterStatus-" + status + " " + bigramClass +"'>" +
               "<div style='width:30px;height:30px;'>" +letter + "</div>";
         if (status == "left") {
            html += renderBigramSubst(bigram, initialSubstitution, 0) + "<br/>";
            html += renderBigramSubst(bigram, newSubstitution, 0) + "<br/>";
         } else if (status == "right") {
            html += renderBigramSubst(bigram, initialSubstitution, 1) + "<br/>";
            html += renderBigramSubst(bigram, newSubstitution, 1) + "<br/>";
         } else {
            html += "<div style='width:30px;height:34px'>" +letter + "</div>";
            html += "<div style='width:30px;height:34px'>" +letter + "</div>";
         }
         html += "</div>" +
            "</div>";
      }
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
                  renderBigrams(self.props.inputSubstitution, self.props.outputSubstitution) +
               "</div>" +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById(self.name).innerHTML = renderTool();
   }

   return self;
}
