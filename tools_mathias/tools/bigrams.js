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
   
   getTextAsBigrams: function(text, alphabet) {
      var textBigrams = [];
      var letterInfos = [];
      var curBigram = "";
      var letterRanks = this.getLetterRanks(alphabet);
      var bigramStart = 0;

      function addBigram(bigram, start, end, iBigram) {
         textBigrams.push(bigram);
         for (var iLetter = start; iLetter < end; iLetter++) {
            letterInfos[iLetter].bigram = bigram;
            letterInfos[iLetter].iBigram = iBigram;
         }
      }
      
      var iLetter = 0;
      var iBigram = 0;
      while (iLetter < text.length) {
         letterInfos.push({});
         var status;
         var letter = text.charAt(iLetter);
         if (letterRanks[letter] != undefined) {
            curBigram += letter;
            if (curBigram.length == 2) {
               addBigram(curBigram, bigramStart, iLetter + 1, iBigram);
               iBigram++;
               curBigram = "";
               status = "right";
            } else {
               status = "left";
               bigramStart = iLetter;
            }
         } else if (curBigram.length == 0) {
            status = "outside";
         } else {
            status = "inside";
         }
         letterInfos[iLetter].status = status;
         iLetter++;
      }
      if (curBigram.length == 1) {
         curBigram += "X";
         addBigram(curBigram, bigramStart, iLetter + 1, iBigram);
      }
      return {
         bigrams: textBigrams,
         letterInfos: letterInfos
      };
   },

   getTextBigrams: function(text, alphabet) {
      var infos = this.getTextAsBigrams(text, alphabet);
      return infos.bigrams;
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

   getBigramSubstPair: function(bigram, substitution, letterRanks) {
      var rank1 = letterRanks[bigram.charAt(0)];
      var rank2 = letterRanks[bigram.charAt(1)];
      var substPair;
      if ((substitution[rank1] != undefined) && (substitution[rank1][rank2] != undefined)) {
         return substitution[rank1][rank2];
      }
      else {
         // TODO: src1 and src2 might be needed in the future
         return {
            dst1: {q: "unknown"},
            dst2 : {q:"unknown" }
         };
      }
   },

   getPairLetterClass: function(cell) {
      if ((cell.q == "locked") || (cell.q == "confirmed")) {
         return "qualifier-confirmed";
      } else {
         return "qualifier-unconfirmed";
      }
   },

   renderBigram: function(alphabet, cell1, cell2, side) {
      var html = "";
      if ((side == undefined) || (side == 0)) {
         html += "<span class='bigramLetter " + this.getPairLetterClass(cell1) + "'>" + common.getCellLetter(alphabet, cell1) + "</span>";
      }
      if ((side == undefined) || (side == 1)) {
         html += "<span class='bigramLetter " + this.getPairLetterClass(cell2) + "'>" + common.getCellLetter(alphabet, cell2) + "</span>";
      }
      return html;
   },

   renderSubstitutionPair: function(pair, alphabet) {
      return "<table class='bigrams'>" +
            "<tr>" +
               "<td>" + bigramsUtils.renderBigram(alphabet, pair.src1, pair.src2) + "</td>" +
               "<td><i class='fa fa-long-arrow-right'></i></td>" +
               "<td>" + bigramsUtils.renderBigram(alphabet, pair.dst1, pair.dst2) + "</td>" +
            "</tr>" +
         "</table>";
   }


}