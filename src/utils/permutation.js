
/**
 * Take as input a permutation-with-qualifiers, and output an array of
 * permutations-without-qualifiers.
 */
export const generatePermutations = function (partialPermutation) {
   const stride = partialPermutation.length;
   // Find the available values, and fill the know positions in curPermutation.
   const valuesAvailable = Array(stride).fill(true);
   const curPermutation = Array(stride);
   for (let iPos = 0; iPos < stride; iPos++) {
      if (partialPermutation[iPos].q !== "unknown") {
         const dstPos = partialPermutation[iPos].dstPos;
         valuesAvailable[] = false;
         curPermutation[iPos] = dstPos;
      }
   }
   const permutations = [];
   const recFillPermutations = function (iPos) {
      if (iPos === stride) {
         // Base case, accumulate the permutation.
         // The copy is necessary as curPermutation is mutated throughout the recursion.
         permutations.push(curPermutation.slice());
         return;
      }
      if (partialPermutation[iPos].q !== "unknown") {
         // Case where the current position is fixed, simply recurse.
         recFillPermutations(iPos + 1);
         return;
      }
      // Enumerate available values for the current position, and recurse.
      for (let value = 0; value < valuesAvailable.length; value++) {
         if (valuesAvailable[value]) {
            curPermutation[iPos] = value;
            valuesAvailable[value] = false;
            recFillPermutations(iPos + 1);
            valuesAvailable[value] = true;
         }
      }
   };
   recFillPermutations(0);
   return permutations;
};

/**
 * Apply a permutation-without-qualifiers to an array of cells.
 */
export const applyPermutation = function (cells, permutation) {
   const stride = permutation.length;
   const srcLength = cells.length;
   let dstLength = srcLength;
   if (srcLength % stride !== 0) {
      dstLength += stride - (srcLength % stride);
   }
   const dstCells = new Array(length);
   for (let srcPos = 0; srcPos < dstLength; srcPos++) {
      let srcCell;
      if (srcPos < srcLength) {
         srcCell = cells[srcPos];
      } else {
         srcCell = {q: "unknown"};
      }
      const modulo = srcPos % stride;
      const dstPos = srcPos - modulo + permutation[modulo];
      dstCells[dstPos] = srcCell;
   }
   return dstCells;
};
