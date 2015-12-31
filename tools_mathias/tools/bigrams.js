var bigrams = {
   mostFrequentFrench: [
      { v: "ES", r: 3.1 },
      { v: "LE", r: 2.2 },
      { v: "DE", r: 2.2 },
      { v: "RE", r: 2.1 },
      { v: "EN", r: 2.1 },
      { v: "ON", r: 1.6 },
      { v: "NT", r: 1.6 },
      { v: "ER", r: 1.5 },
      { v: "TE", r: 1.5 },
      { v: "ET", r: 1.4 },
      { v: "EL", r: 1.4 },
      { v: "AN", r: 1.4 },
      { v: "SE", r: 1.3 },
      { v: "LA", r: 1.3 },
      { v: "AI", r: 1.2 },
      { v: "NE", r: 1.1 },
      { v: "OU", r: 1.1 },
      { v: "QU", r: 1.1 },
      { v: "ME", r: 1.1 },
      { v: "IT", r: 1.1 },
      { v: "IE", r: 1.1 },
      { v: "ED", r: 1.0 },
      { v: "EM", r: 1.0 },
      { v: "UR", r: 1.0 },
      { v: "IS", r: 1.0 },
      { v: "EC", r: 1.0 },
      { v: "UE", r: 0.9 },
      { v: "TI", r: 0.9 },
      { v: "RA", r: 0.9 },
      { v: "IN", r: 0.8 }
   ],

   getLetterRanks: function(alphabet) {
      var letterRanks = {};
      for (var iLetter = 0; iLetter < alphabet.length; iLetter++) {
         letterRanks[alphabet[iLetter]] = iLetter;
      }
      return letterRanks;
   },

   getTextBigrams: function(text, alphabet) {
      var iLetter = 0;
      var curBigram = "";
      var letterRanks = this.getLetterRanks(alphabet);
      while (iLetter < text.length) {
         var letter = text.charAt(iLetter);
//         if (letterRanks[
      }
   },

   getMostFrequentBigrams: function(text) {
   },

   getPairLetterClass: function(cell) {
      if ((cell.q == "locked") || (cell.q == "confirmed")) {
         return "qualifier-confirmed";
      }
      return "";
   },

   renderBigram: function(alphabet, cell1, cell2) {
      return "<table class='substitutionPair'><tr>" +
         "<td class='" + this.getPairLetterClass(cell1) + "'>" + common.getCellLetter(alphabet, cell1) + "</td>" +
         "<td class='" + this.getPairLetterClass(cell2) + "'>" + common.getCellLetter(alphabet, cell2) + "</td>" +
      "</tr></table>";
   },

   renderBigrams: function() {
      var frequencies = "<tr class='bigramsFrequencies'><td>Fréquence&nbsp;:</td>";
      var bigramsHtml = "<tr class='bigramsValues'><td>Bigrammes&nbsp;:</td>";
      var bigrams = this.mostFrequentFrench;
      for (var iBigram = 0; iBigram < bigrams.length; iBigram++) {
         var bigram = bigrams[iBigram];
         frequencies += "<td>" + bigram.r + "%</td>";
         bigramsHtml += "<td><div style='border: solid black 1px;margin:4px;width:30px'>" + bigram.v.charAt(0) + "&nbsp;"  + bigram.v.charAt(1) + "</div></td>";
      }
      frequencies += "</tr>";
      bigramsHtml += "</tr>";
      return "<strong>Bigrammes les plus fréquents en français</strong>" +
      "<div style='overflow-x:scroll; border:solid black 1px;margin:5px'>"+
         "<table class='listBigrams'>" + frequencies + bigramsHtml + "</table>" +
      "</div>";
   }
}