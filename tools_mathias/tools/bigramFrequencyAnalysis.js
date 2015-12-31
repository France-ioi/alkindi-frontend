function getBigramFrequencyAnalysis() {
   var self = {};

   self.name = "bigramFrequencyAnalysis";

   self.props = {
      alphabet: playFair.alphabet,
      frenchBigrams: bigrams.mostFrequentFrench,
      inputCipheredText: playFair.sampleCipheredText,
      inputSubstitution: playFair.sampleSubstitution,
      outputSubstitution: playFair.sampleSubstitution,
      inputCipheredTextVariable: "texteChiffré",
      inputSubstitutionVariable: "substitution",
      outputSubstitutionVariable: "nouvelleSubstitution"
   };

   self.state = {
      textBigrams: undefined,
      editState: undefined,
      edit: undefined
   };

   var renderInstructionPython = function() {
      return self.props.outputSubstitutionVariable + " = analyseFrequenceBigrammes(" +
         self.props.inputCipheredTextVariable + ", " +
         self.props.inputSubstitutionVariable + ", " +
         "..." +
         ")"
   };
   
   var renderEditCell = function() {
      if (self.state.editState == "preparing") {
         var row = self.state.edit.row;
         var col = self.state.edit.col;
         return "<div class='dialog'>" +
               "<table>" +
                  "<tr>" +
                     "<td><strong>Bigramme édité :</strong></td>" +
                     "<td>" + "TODO" + "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Substitution d'origine :</strong></td>" +
                     "<td>" + "TODO" + "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Nouvelle substitution :</strong></td>" +
                     "<td>" + "TODO" + "</td>" +
                  "</tr>" +
                  "<tr>" +
                     "<td><strong>Bloquer / débloquer :</strong></td>" +
                     "<td>" +
                        "<button style='width:60px'><img src='lock.png'></button>" +
                        "<button style='width:60px'><img src='lock.png'></button>" +
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

   var renderTool = function() {
      return "<div style='width:700px;border: solid black 1px'>" +
            "<div style='width:100%;border: solid black 1px;box-sizing: border-box;padding:3px'>" + 
               renderInstructionPython() +
            "</div>" +
            "<div style='overflow:auto'>" +
               "<div style='float:right; margin:3px'>" +
                  renderEditCell() +
               "</div>" +
               renderVariables() +
            "</div>" +
            "<span style='clear:both'></span>" +
            "<strong>Bigrammes en conflit :</strong> " + "TODO" + "<br/>" +
            bigrams.renderBigrams() +
         "</div>";
   };

   self.render = function() {
      document.getElementById(self.name).innerHTML = renderTool();
   }

   return self;
}
