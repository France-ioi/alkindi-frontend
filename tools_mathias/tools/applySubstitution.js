function getApplySubstitution() {
   var self = {};

   self.name = "applySubstitution";

   var sampleSubstitutionModified = playFair.getSampleSubstitution();
   sampleSubstitutionModified[10][9] = {
      src: [{ l: 10, q:"confirmed" }, { l: 0, q:"confirmed" }],
      dst: [{ q:"unknown" }, { l: 21, q:"confirmed" }]
   };
   
   self.props = {
      alphabet: playFair.alphabet,      
      inputCipheredText: playFair.sampleCipheredText,
      inputSubstitution: playFair.getSampleSubstitution(),
      outputDecipheredText: "",
      inputCipheredTextVariable: "texteChiffré",
      inputSubstitutionVariable: "substitution",
      outputDecipheredTextVariable: "texteDéchiffré"
   };

   self.state = {
      textBigrams: undefined
   };

   self.letterRanks = common.getLetterRanks(playFair.alphabet);

   self.compute = function() {
      var letterInfos = bigramsUtils.getTextAsBigrams(self.props.inputCipheredText, self.props.alphabet).letterInfos;
      var text = "";
      for (var iLetter = 0; iLetter < letterInfos.length; iLetter++) {
         var status = letterInfos[iLetter].status;
         var letter;
         if ((status != "left") && (status != "right")) {
            letter = "<span class='substituedLetter character'>" +  self.props.inputCipheredText[iLetter] + "</span>";
         } else {
            var bigram = letterInfos[iLetter].bigram;
            var substPair = bigramsUtils.getBigramSubstPair(bigram, self.props.inputSubstitution, self.letterRanks);
            if (status == "left") {
               letter = "<span class='substituedLetter'>" +  common.getCellLetter(self.props.alphabet, substPair.dst[0]) + "</span>";
            } else {
               letter = "<span class='substituedLetter'>" + common.getCellLetter(self.props.alphabet, substPair.dst[1]) + "</span>";
            }
         }
         if (letter == '') {
            letter = "<span class='substituedLetter'>&nbsp;</span>";
         }
         text += letter;
      }
      self.props.outputDecipheredText = text;
   };

   var renderInstructionPython = function() {
      return "<span class='code-var'>" + self.props.outputDecipheredTextVariable + "</span> = appliqueSubstitution(" +
         self.props.inputCipheredTextVariable + ", " +
         self.props.inputSubstitutionVariable +
         ")";
   };

   var renderVariables = function() {
      return common.renderVariables({
         input: [
            {label: "Texte chiffré analysé", name: self.props.inputCipheredTextVariable},
            {label: "Substitution d'origine", name: self.props.inputSubstitutionVariable}
         ],
         output: [
            {label: "Nouvelle subsitution", name: self.props.outputDecipheredTextVariable}
         ]
      });
   };

   var renderText = function(text) {
      return text;
   };

   var renderTool = function() {
      return "<div class='panel panel-default'>" +
            "<div class='panel-heading'><span class='code'>" +
               renderInstructionPython() +
            "</span></div>" +
            "<div class='panel-body'>" +
               renderVariables() +
               "<div class='grillesSection'>" +
                  "<div class='y-scrollBloc'>" +
                     renderText(self.props.outputDecipheredText) +
                  "</div>" +
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
