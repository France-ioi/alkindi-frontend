var bigramsUtils = {
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
      var textBigrams = [];
      var curBigram = "";
      var letterRanks = this.getLetterRanks(alphabet);
      var iLetter = 0;
      while (iLetter < text.length) {
         var letter = text.charAt(iLetter);
         if (letterRanks[letter] != undefined) {
            curBigram += letter;
            if (curBigram.length == 2) {
               textBigrams.push(curBigram);
               curBigram = "";
            }
         }
         iLetter++;
      }
      if (curBigram.length == 1) {
         curBigram += "X";
         textBigrams.push(curBigram);
      }
      return textBigrams;
   },

   getMostFrequentBigrams: function(text, alphabet) {
      var bigramCounts = {};
      var textBigrams = this.getTextBigrams(text, alphabet);
      for (var iBigram = 0; iBigram < textBigrams.length; iBigram++) {
         var bigram = textBigrams[iBigram];
         if (bigramCounts[bigram] == undefined) {
            bigramCounts[bigram] = 0;
         }
         bigramCounts[bigram]++;
      }
      var bigramInfos = [];
      for (var bigram in bigramCounts) {
         var rate = bigramCounts[bigram] / textBigrams.length * 100;
         rate = rate.toFixed(1);
         bigramInfos.push({ v: bigram, r: rate });
      }
      bigramInfos.sort(function(b1, b2) {
         if (b1.r > b2.r) {
            return -1;
         }
         if (b1.r < b2.r) {
            return 1;
         }
         return 0;
      });
      bigramInfos.splice(30, bigramInfos.length - 30);
      return bigramInfos;
   },

   getPairLetterClass: function(cell) {
      if ((cell.q == "locked") || (cell.q == "confirmed")) {
         return "qualifier-confirmed";
      } else {
         return "qualifier-unconfirmed";
      }
   },

   renderBigram: function(alphabet, cell1, cell2, side) {
      var html = "<table class='substitutionPair' style='display:inline-block'><tr>";
      if ((side == undefined) || (side == 0)) {
         html += "<td class='" + this.getPairLetterClass(cell1) + "'>" + common.getCellLetter(alphabet, cell1) + "</td>";
      }
      if ((side == undefined) || (side == 1)) {
         html += "<td class='" + this.getPairLetterClass(cell2) + "'>" + common.getCellLetter(alphabet, cell2) + "</td>";
      }
      html += "</tr></table>";
      return html;
   }
}