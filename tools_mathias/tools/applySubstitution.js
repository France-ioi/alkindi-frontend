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
      inputSubstitutionVariable: "substitutionAméliorée",
      outputDecipheredTextVariable: "texteDéchiffré"
   };

   self.state = {
      textBigrams: undefined
   };

   self.letterRanks = common.getLetterRanks(playFair.alphabet);

   self.compute = function() {
      var letterInfos = bigramsUtils.getTextAsBigrams(self.props.inputCipheredText, self.props.alphabet).letterInfos;
      var outputText = [];
      for (var iLetter = 0; iLetter < letterInfos.length; iLetter++) {
         var status = letterInfos[iLetter].status;
         var letter;
         var qualifier = "";
         if ((status != "left") && (status != "right")) {
            letter = self.props.inputCipheredText[iLetter];
         } else {
            var bigram = letterInfos[iLetter].bigram;
            var substPair = bigramsUtils.getBigramSubstPair(bigram, self.props.inputSubstitution, self.letterRanks);
            if (status == "left") {
               letter = common.getCellLetter(self.props.alphabet, substPair.dst[0]);
               qualifier = substPair.dst[0].q;
            } else {
               letter = common.getCellLetter(self.props.alphabet, substPair.dst[1]);
               qualifier = substPair.dst[1].q;
            }
         }
         if (letter == '') {
            letter = "&nbsp;";
         }
         if (qualifier == "locked") {
            qualifier = "confirmed";
         }
         outputText.push({letter: letter, q: qualifier, s: status});
      }
      self.props.outputDecipheredText = outputText;
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
            {label: "Texte chiffré", name: self.props.inputCipheredTextVariable},
            {label: "Substitution appliquée", name: self.props.inputSubstitutionVariable}
         ],
         output: [
            {label: "Texte déchiffré", name: self.props.outputDecipheredTextVariable}
         ]
      });
   };

   var getFakeTextFromCells = function(cells) {
      var text = "";
      for (var iCell = 0; iCell < cells.length; iCell++) {
         var qualifier = cells[iCell].q;
         var letter;
         if (qualifier == "") {
            letter = " ";
         } else {
            letter = self.props.alphabet[0];
         }
         text += letter;
      }
      return text;
   };

   var renderText = function(cells) {
      var nbLettersPerRow = 29;
      var text = getFakeTextFromCells(cells);
      var lineStartCols = common.getWrappingInfos(text, 29, self.props.alphabet);
      var html = "";
      var line = 0;
      for (var iCell = 0; iCell < cells.length; iCell++) {
         var cell = cells[iCell];
         if (lineStartCols[line + 1] == iCell) {
            html += "<br />";
            line++;
         }
         var qualifierClass = bigramsUtils.getPairLetterClass(cell); // TODO: use substitution.getQualifierClass in react version
         if (cell.q == "") {
            html += "<span class='substituedLetter character'>" +  cell.letter + "</span>";
         } else if (cell.s == "left") {
            html += "<span class='substituedLetter " + qualifierClass + "'>" +  cell.letter + "</span>";
         } else if (cell.s == "right") {
            html += "<span class='substituedLetter " + qualifierClass + "'>" + cell.letter + "</span>";
         }
      }
      return html;
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
