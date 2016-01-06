function getDisplayText() {
   var self = {};

   self.name = "displayText";

   self.props = {
      alphabet: playFair.alphabet,      
      outputCipheredText: playFair.sampleCipheredText,
      outputCipheredTextVariable: "texteChiffré",
   };

   self.state = {
   };

   var renderInstructionPython = function() {
      return "<span class='code-var'>" + self.props.outputCipheredTextVariable + "</span> = '" +
         self.props.outputCipheredText +
         ")";
   };

   var renderVariables = function() {
      return common.renderVariables({
         input: [
         ],
         output: [
            {label: "Texte chiffré", name: self.props.outputCipheredTextVariable},
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
                     renderText(self.props.outputCipheredText) +
                  "</div>" +
               "</div>" +
            "</div>" +
         "</div>";
   };

   self.render = function() {
      document.getElementById(self.name).innerHTML = renderTool();
   }

   return self;
}
