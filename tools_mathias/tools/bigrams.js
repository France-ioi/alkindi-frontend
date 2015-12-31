var bigrams = {
   getPairLetterClass: function(cell) {
      if ((cell.q == "locked") || (cell.q == "confirmed")) {
         return "qualifier-confirmed";
      }
      return "";
   },

   render: function(alphabet, cell1, cell2) {
      return "<table class='substitutionPair'><tr>" +
         "<td class='" + this.getPairLetterClass(cell1) + "'>" + common.getCellLetter(alphabet, cell1) + "</td>" +
         "<td class='" + this.getPairLetterClass(cell2) + "'>" + common.getCellLetter(alphabet, cell2) + "</td>" +
      "</tr></table>";
   }
}