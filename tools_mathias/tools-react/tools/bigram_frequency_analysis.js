import classnames from 'classnames';

import {PureComponent} from '../utils';
import {Variables} from '../ui/variables';
import {OkCancel} from '../ui/ok_cancel';
import * as Python from '../python';
import {getCellLetter, getQualifierClass} from '../tools';
import {getTextBigrams, getMostFrequentBigrams, getBigramSubstPair,
        countSubstitutionConflicts, identitySubstPair} from '../bigram_utils';

const nullSubstPair = {dst: [{q: "unknown"}, {q: "unknown"}]};

export const Component = PureComponent(self => {

   /*
      props:
         toolState:
            inputCipheredTextVariable
            inputSubstitutionVariable
            outputSubstitutionVariable
            substitutionEdits
         scope:
            alphabet
            frenchBigrams
            inputCipheredText
            inputSubstitution
            outputSubstitution
            mostFrequentFrench
            mostFrequentBigrams
   */

   const clickBigram = function (event) {
      const {substitutionEdits} = self.props.toolState;
      const {alphabet, mostFrequentBigrams} = self.props.scope;
      const iBigram = parseInt(event.currentTarget.getAttribute('data-i'));
      const bigram = mostFrequentBigrams[iBigram];
      const editPair = substitutionEdits[bigram.v] || [{locked: false}, {locked: false}];
      self.setState({
         editState: "preparing",
         editPair: editPair,
         selectedPos: iBigram
      });
   };

   const changeLetter = function (event) {
      let {editPair} = self.state;
      const letter = event.target.value;
      const side = parseInt(event.target.getAttribute('data-side'));
      editPair = editPair.slice();
      editPair[side] = {...editPair[side], letter: letter};
      self.setState({editPair: newEditPair});
   };

   const toggleLock = function () {
      let {editPair} = self.state;
      const letter = event.target.value;
      const side = parseInt(event.target.getAttribute('data-side'));
      editPair = editPair.slice();
      editPair[side] = {...editPair[side], locked: !editPair[side].locked};
      self.setState({editPair: newEditPair});
   };

   const validateDialog = function () {
   };

   const cancelDialog = function () {
   };

   const renderInstructionPython = function () {
      const {inputCipheredTextVariable, inputSubstitutionVariable, outputSubstitutionVariable} = self.props.toolState;
      return (
         <Python.Assign>
            <Python.Var name={outputSubstitutionVariable}/>
            <Python.Call name="analyseFrequenceBigrammes">
               <Python.Var name={inputCipheredTextVariable}/>
               <Python.Var name={inputSubstitutionVariable}/>
               <span>…</span>
            </Python.Call>
         </Python.Assign>
      );
   };

   const renderVariables = function () {
      const {inputCipheredTextVariable, inputSubstitutionVariable, outputSubstitutionVariable} = self.props.toolState;
      const inputVars = [
         {label: "Texte chiffré analysé", name: inputCipheredTextVariable},
         {label: "Substitution d'origine", name: inputSubstitutionVariable}
      ];
      const outputVars = [
         {label: "Nouvelle subsitution", name: outputSubstitutionVariable}
      ];
      return <Variables inputVars={inputVars} outputVars={outputVars} />;
   };

   const renderLock = function (cond) {
      return cond ? <i className='fa fa-lock'></i> : ' ';
   };

   const renderCell = function (alphabet, cell) {
      const classes = ['bigramLetter', getQualifierClass(cell.q)];
      return <span className={classnames(classes)}>{getCellLetter(alphabet, cell, true)}</span>;
   };

   const renderBigram = function (bigram) {
      const {v} = bigram;
      return <span>{v.charAt(0)+'\u00a0'+v.charAt(1)}</span>;
   };

   const renderEditPair = function () {
      const {selectedPos, editPair} = self.state;
      const {alphabet, mostFrequentBigrams, initialSubstitution} = self.props.scope;
      var bigram = mostFrequentBigrams[selectedPos];
      var substPair = getBigramSubstPair(initialSubstitution, bigram) || nullSubstPair;
      var buttonLockedClasses = [];
      var btnToggleClasses = [];
      for (var iSide = 0; iSide < 2; iSide++) {
         const locked = editPair[iSide].locked;
         buttonLockedClasses[iSide] = ['btn-toggle', 'lock', locked && "locked"];
         btnToggleClasses[iSide] = ["fa", "fa-toggle-" + (locked ? "on" : "off")];
      }
      return (
         <div className='dialog'>
            <div className='dialogLine'>
               <span className='dialogLabel'>Bigramme édité :</span>
               <span className='dialogBigram bigramCipheredLetter'>
                  <span className='bigramLetter'>
                     {renderCell(alphabet, {l: bigram.l0})}
                  </span>
                  <span class='bigramLetter'>
                     {renderCell(alphabet, {l: bigram.l1})}
                  </span>
               </span>
            </div>
            <div className='dialogLine'>
               <span className='dialogLabel'>Substitution d'origine :</span>
               <span className='dialogBigram dialogBigramSubstOrig'>
                  {renderCell(alphabet, substPair.dst[0])}
                  {renderCell(alphabet, substPair.dst[1])}
               </span>
            </div>
            <div className='dialogLine'>
               <span className='dialogLabel'>Nouvelle substitution :</span>
               <span className='dialogLetterSubst'>
                  <input type='text' value={editPair[0].letter} onChange={changeLetter} data-side='0' />
               </span>
               <span className='dialogLetterSubst'>
                  <input type='text' value={editPair[1].letter} onChange={changeLetter} data-side='1' />
               </span>
            </div>
            <div className='dialogLine'>
               <span class='dialogLabel'> </span>
               <span class='substitutionLock'>{renderLock(editPair[0].locked)}</span>
               <span class='substitutionLock'>{renderLock(editPair[1].locked)}</span>
            </div>
            <div className='dialogLine'>
               <span class='dialogLabel'>Bloquer / débloquer : <i class='fa fa-question-circle' data-toggle='tooltip' data-placement='top' title='Aide contextuelle'></i></span>
               <span>
                  <button type='button' className={classnames(buttonLockedClasses[0])} onClick={toggleLock} data-side='0' >
                     <i className={classnames(btnToggleClasses[0])}/>
                  </button>
               </span>
               <span>
                  <button type='button' className={classnames(buttonLockedClasses[1])} onClick={toggleLock} data-side='1' >
                     <i className={classnames(btnToggleClasses[1])}/>
                  </button>
               </span>
            </div>
            <OkCancel onOk={validateDialog} onCancel={cancelDialog}/>
         </div>
      );
   };

   const renderFreqBigrams = function (bigrams) {
      const {alphabet} = self.props.scope;
      const renderFreqBigram = function (bigram) {
         return (
            <div className='bigramBloc'>
               <span className='frequence'>{bigram.r} %</span>
               <div className='bigramBlocSubstitution'>
                  <div className='bigramCipheredLetter'>
                     {renderBigram(bigram)}
                  </div>
               </div>
            </div>
         );
      };
      return (
         <div className='x-scrollBloc'>
            <div className='labels'>
               <div>Fréquences :</div>
               <div>Bigrammes :</div>
            </div>
            {bigrams.map(renderFreqBigram)}
         </div>
      );
   };

   const renderFreqSubstBigrams = function (bigrams, initialSubstitution, newSubstitution) {
      const {alphabet} = self.props.scope;
      const {selectedPos} = self.state;
      const testConflict = function (cell1, cell2) {
         return cell1 !== 'unknown' && cell2 !== 'unknown' && cell1.l !== cell2.l;
      };
      const renderBigramSubstSide = function (bigram, initialPair, newPair, side) {
         const initialCell = initialPair.dst[side];
         const newCell = newPair.dst[side];
         const hasConflict = testConflict(initialCell, newCell);
         const isLocked = newCell.q === "locked";
         return (
            <div className={classnames(['substitutionPair', hasConflict && 'substitutionConflict'])}>
               <span className='originLetter'>
                  {renderCell(alphabet, initialCell)}
               </span>
               <span className='newLetter'>
                  {renderCell(alphabet, newCell)}
               </span>
               <span className='substitutionLock'>
                  {isLocked ? <i className='fa fa-lock'></i> : ' '}
               </span>
            </div>
         );
      };
      const renderFreqSubstBigram = function (bigram, iBigram) {
         const bigramClasses = ['bigramBlocSubstitution'];
         if (selectedPos === iBigram)
            bigramClasses.push("selectedBigram")
         const initialPair = getBigramSubstPair(initialSubstitution, bigram) || nullSubstPair;
         const newPair = getBigramSubstPair(newSubstitution, bigram) || nullSubstPair;
         if (bigram.v === 'KQ') {
            console.log(initialSubstitution);
         }
         return (
            <div className='bigramBloc' onClick={clickBigram} data-i={iBigram} >
               <span className='frequence'>{bigram.r} %</span>
               <div className={classnames(bigramClasses)}>
                  <div className='bigramCipheredLetter'>{renderBigram(bigram)}</div>
                  {renderBigramSubstSide(bigram, initialPair, newPair, 0)}
                  {renderBigramSubstSide(bigram, initialPair, newPair, 1)}
               </div>
            </div>
         );
      };
      return (
         <div className='x-scrollBloc'>
            <div className='labels'>
               <div>Fréquences :</div>
               <div>Bigrammes :</div>
               <div>Substitution d'origine :</div>
               <div>Nouvelle substitution :</div>
            </div>
            {bigrams.map(renderFreqSubstBigram)}
         </div>
      );
   }

   self.render = function () {
      const {editPair} = self.state;
      const {toolState, scope} = self.props;
      const {inputCipheredTextVariable, inputSubstitutionVariable, outputSubstitutionVariable} = toolState;
      const {alphabet, inputSubstitution, outputSubstitution, mostFrequentFrench, mostFrequentBigrams} = scope;
      const nConflicts = countSubstitutionConflicts(mostFrequentBigrams, inputSubstitution, outputSubstitution);
      const textBigrams = renderFreqSubstBigrams(mostFrequentBigrams, inputSubstitution, outputSubstitution);
      const frenchBigrams = renderFreqBigrams(mostFrequentFrench);
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  {renderInstructionPython()}
               </span>
            </div>
            <div className='panel-body'>
               {editPair && renderEditPair()}
               {renderVariables()}
               <div className='bigramFrequencyAnalysis grillesSection'>
                  <strong>Nombre de conflits :</strong> {nConflicts}<br/>
                  <strong>Bigrammes les plus fréquents du texte d'entrée :</strong>
                  {textBigrams}
                  <strong>Bigrammes les plus fréquents en français :</strong>
                  {frenchBigrams}
               </div>
            </div>
         </div>
      );
   };

}, self => {
   return {
      editState: undefined,
      edit: undefined
   };
});

export const compute = function (toolState, scope) {
   const {alphabet, inputCipheredText, inputSubstitution} = scope;
   scope.textBigrams = getTextBigrams(inputCipheredText, alphabet);
   scope.mostFrequentBigrams = getMostFrequentBigrams(scope.textBigrams);
   scope.outputSubstitution = inputSubstitution; // XXX substitutionEdits
};

export default self => {
   self.state = {
  };
  self.Component = Component;
  self.compute = compute;
};


/*

function getBigramFrequencyAnalysis() {
   var self = {};

   self.name = "bigramFrequencyAnalysis";

   var sampleSubstitutionModified = playFair.getSampleSubstitution();
   sampleSubstitutionModified[10][9] = {
      src: [{ l: 10, q:"confirmed" }, { l: 0, q:"confirmed" }],
      dst: [{ q:"unknown" }, { l: 21, q:"locked" }]
   }

   self.props = {
      alphabet: playFair.alphabet,      
      inputCipheredText: playFair.sampleCipheredText,
      inputSubstitution: [],
      outputSubstitution: [], //sampleSubstitutionModified,
      inputCipheredTextVariable: "texteChiffré",
      inputSubstitutionVariable: "substitutionDépart",
      outputSubstitutionVariable: "substitutionFréquences"
   };

   self.state = {
      textBigrams: undefined,
      editState: undefined,
      edit: undefined,
      scrollLeftText: 0,
      scrollLeftFrench: 0
   };

   self.mostFrequentBigrams = bigramsUtils.getMostFrequentBigrams(self.props.inputCipheredText, self.props.alphabet);
   self.letterRanks = common.getLetterRanks(playFair.alphabet);

   self.compute = function() {
      bigramsUtils.updateSubstitution(self.props.inputSubstitution, self.props.outputSubstitution);
   };

   self.changeBigramSubstLetter = function(iLetter) {
      var letter = document.getElementById("editBigramSubstLetter" + (iLetter + 1)).value;
      self.state.edit.letters[iLetter] = letter;
   };

   self.validateDialog = function() {
      var letterRanks = common.getLetterRanks(playFair.alphabet);
      // TODO: get from state and store in state on change
      var letters = self.state.edit.letters;
      for (var iLetter = 0; iLetter < 2; iLetter++) {
         var letter = letters[iLetter];
         if ((letter != '') && (letterRanks[letter] == undefined)) {
            alert(letter + " n'est pas une valeur possible de la grille");
            return;
         }
      }
      var bigram = self.mostFrequentBigrams[self.state.edit.iBigram];
      var substPair = self.state.edit.substPair;
      for (var iLetter = 0; iLetter < 2; iLetter++) {
         if (letters[iLetter] != "") {
            var cell = substPair.dst[iLetter]
            cell.l = letterRanks[letters[iLetter]];
            cell.q = "guess";
            if (self.state.edit.locked[iLetter]) {
               cell.q = "locked";
            }
         }
      }
      var rank1 = letterRanks[bigram.v.charAt(0)];
      var rank2 = letterRanks[bigram.v.charAt(1)];
      if (self.props.outputSubstitution[rank1] == undefined) {
         self.props.outputSubstitution[rank1] = [];
      }
      self.props.outputSubstitution[rank1][rank2] = substPair;

      self.cancelDialog();
   }

   self.cancelDialog = function() {
      self.state.edit = undefined;
      self.state.editState = undefined;
      renderAll();
   }

   self.toggleLockLetter = function(iLetter) {
      self.state.edit.locked[iLetter] = !self.state.edit.locked[iLetter];
      renderAll();
   };

   return self;
}
*/
