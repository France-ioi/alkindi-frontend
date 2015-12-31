var playFair = {
   alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'],

   sampleGrid: [
      [{q:'unknown'}, {l:10, q:'locked'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {l:0, q:'locked'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
      [{q:'unknown'}, {l:7, q:'confirmed'}, {q:'unknown'}, {l:4, q:'confirmed'}, {q:'unknown'}],
      [{l:9, q:'confirmed'}, {l:20, q:'confirmed'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
   ],

   sampleCipheredText: "KJ LTDKY IPXJAPUJ QFILH HUBN HXBXODDQI,KO HBNIFBNB QAOKM NA DQUIM KUIJHODJAJ QO HJEYCBN.XPCZ JOBK DOKDQ YVHNB HXIDDJFYMQ JY XPCZ JGKJK BD EQOZUQYRNB QZTG ZDBYM B HYQ NA DQF MMHYACVYJG FFLUFJYMK.JKKJ KM UIPHQJ HOFK YR QBJTH LBDNA AJBPKJ.QPBU XPCZ U NQYRNJ,BSVKJG BY HQYJ LFILH KMVU APTZJQBDR DNFANNFHU GELFGLT.LPHK C UIPHQJNBR PJBYHPHO RA NXHCBQYCL J OPHG FM NJDNB KJ UIR.VPHI Z'PHPIFN,XPCZ JOBK EJGXFI RH RYAJDP RH APQ MH IJ KM HXAJRDEFLQD RH HMNADEF.MM KCKYJAJ NA HUFDDNJAQYY I'MKU VMG DMTJ QPBU KJK FXAPUMK,BHFSLF MJ KJG MN JUFTJF MF-RMKGXCZ,HUFDDNMK JOMY YR BHUIM KCKYJAJ.YM HXNA YQ HGTJ QY BHHYF YMG JYNB MYNFH VH RTLTZZHJ B YR JTBNL.XPHG FJQBK KJF MJGHYKJN RJ KB AEDNJNB ZCTLEDYJ HXIQBNJTFSKMK SMK KJCVUIMK NA XPUIB QNBDQA BQJH M DMTJ YR,M RJDH IBYQ,MCH JY BCIJRVITBK KJL CPHYJF.XTZJTVZNJK SB NMKTZHJU VBD LTDKCV-UIVDZ XTRF CJDYJF XVDFK GXFVEDYJ-UIVDL.XPHL XQYBK NA HMSTTZBN XPUIM YKJ.MDFI NA UIPHQJI ZJ EPO,TI XPCZ DMYC ZUQYRNJ KA KDBIR DQAENB TF NAFSGXCZ JY H EFORFJTQDYQI PFILH-YQCR.KJ NBZCIJJH PAYJRY HGTJ JYNB RFLTKM OBI PVHNB TSM.YJKO HQDYQ TFYK HUFDDNMK,KJG FBYO QNBJFBNF MPDNBZXQDNAIY BH RYAJDP NA APV,SMK BHUIMK J GM HXAJRDEFLQD RH HMNADEF.S",

   getSampleSubstitution: function() {
      return this.getSubstitutionFromGridCells(this.sampleGrid);
   },
   
   // TODO : ne pas passer self mais les parties qui seront utilisées
   // Deviendra un composant react => sebc s'en occupera
   renderGrid: function(toolName, cells, selectedRow, selectedCol) {
      var strHtml = "<table class='playFairGrid'>";
      var nbRows = cells.length;
      var nbCols = cells[0].length;
      for (var row = 0; row < nbRows; row++) {
         strHtml += "<tr>";
         for (var col = 0; col < nbCols; col++) {
            var cell = cells[row][col];
            var queryClass = "";
            if ((selectedRow === row) && (selectedCol === col)) {
               queryClass = "cell-query";
            }
            strHtml += "<td class='" + queryClass + " " + "qualifier-" + cell.q + "' onClick='" + toolName + ".clickGridCell(" + row + "," + col + ")'>";
            strHtml += common.getCellLetter(this.alphabet, cell);
            strHtml += "</td>";
         }
         strHtml += "</tr>";
      }
      strHtml += "</table>";
      return strHtml;
   },

   addToSubstitution: function(cells, substitution, row1, col1, row2, col2) {
      var cellSrc1 = cells[row1][col1];
      var cellSrc2 = cells[row2][col2];
      if ((cellSrc1.l == undefined) || (cellSrc2.l == undefined)) {
         return undefined;
      }
      var cellDst1;
      var cellDst2;

      if ((row1 != row2) && (col1 != col2)) {
         cellDst1 = cells[row1][col2];
         cellDst2 = cells[row2][col1];
      } else if (row1 == row2) {
         cellDst1 = cells[row1][(col1 + 4) % 5];
         cellDst2 = cells[row2][(col2 + 4) % 5];
      } else {
         cellDst1 = cells[(row1 + 4) % 5][col1];
         cellDst2 = cells[(row2 + 4) % 5][col2];
      }

      if ((cellDst1.l == undefined) && (cellDst2.l == undefined)) {
         return undefined;
      }
      if (substitution[cellSrc1.l] == undefined) {
         substitution[cellSrc1.l] = [];
      }
      if (substitution[cellSrc2.l] == undefined) {
         substitution[cellSrc2.l] = [];
      }
      substitution[cellSrc1.l][cellSrc2.l] = {
         src1 : {l: cellSrc1.l, q: cellSrc1.q },
         src2 : {l: cellSrc2.l, q: cellSrc2.q },
         dst1 : {l: cellDst1.l, q: cellDst1.q },
         dst2 : {l: cellDst2.l, q: cellDst2.q }
      };
      substitution[cellSrc2.l][cellSrc1.l] = {
         src2 : {l: cellSrc1.l, q: cellSrc1.q },
         src1 : {l: cellSrc2.l, q: cellSrc2.q },
         dst2 : {l: cellDst1.l, q: cellDst1.q },
         dst1 : {l: cellDst2.l, q: cellDst2.q }
      }
   },

   getSubstitutionFromGridCells: function(cells) {
      var substitution = [];
      var nbRows = cells.length;
      var nbCols = cells[0].length;
      for (var row1 = 0; row1 < nbRows; row1++) {
         for (var col1 = 0; col1 < nbCols; col1++) {
            var startCol2 = col1 + 1;
            for (var row2 = row1; row2 < nbRows; row2++) {
               for (var col2 = startCol2; col2 < nbCols; col2++) {
                   playFair.addToSubstitution(cells, substitution, row1, col1, row2, col2);
               }
               startCol2 = 0;
            }
         }
      }
      return substitution;
   }
};
