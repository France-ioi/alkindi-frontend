import classnames from 'classnames';

import {PureComponent} from '../utils';
import {Variables} from '../ui/variables';
import {OkCancel} from '../ui/ok_cancel';
import * as Python from '../python';
import {getCellLetter, getQualifierClass, getStringWrapping, testConflict} from '../tools';
import {getTextAsBigrams, getMostFrequentBigrams, getBigramSubstPair, nullSubstPair,
        countAllSubstitutionConflicts, applySubstitutionEdits, sideOfStatus} from '../bigram_utils';
import EditPairDialog from '../ui/edit_pair_dialog';

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
            inputCipheredText
            inputSubstitution
            outputSubstitution
   */

   const clickBigram = function (event) {
      const {substitutionEdits} = self.props.toolState;
      const {alphabet, letterInfos} = self.props.scope;
      const iLetter = parseInt(event.currentTarget.getAttribute('data-i'));
      const bigram = letterInfos[iLetter].bigram;
      const editPair = substitutionEdits[bigram.v] || [{locked: false}, {locked: false}];
      self.setState({
         editPair: editPair,
         selectedLetterPos: iLetter
      });
   };

   const validateDialog = function (checkedEditPair) {
      const {selectedLetterPos, editPair} = self.state;
      const {alphabet, letterInfos} = self.props.scope;
      const {v} = letterInfos[selectedLetterPos].bigram;
      const {toolState, setToolState} = self.props;
      let newEdits = {...toolState.substitutionEdits};
      if (!checkedEditPair[0] && !checkedEditPair[1])
         delete newEdits[v];
      else
         newEdits[v] = checkedEditPair;
      setToolState({substitutionEdits: newEdits});
      cancelDialog();
   };

   const cancelDialog = function () {
      self.setState({
         editPair: undefined,
         selectedLetterPos: undefined
      });
   };

   const renderInstructionPython = function () {
      const {inputCipheredTextVariable, inputSubstitutionVariable, outputSubstitutionVariable} = self.props.toolState;
      return (
         <Python.Assign>
            <Python.Var name={outputSubstitutionVariable}/>
            <Python.Call name="éditeSubstitution">
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

   const setEditPair = function (editPair) {
      self.setState({editPair});
   };

   const renderEditPair = function () {
      const {selectedLetterPos, editPair} = self.state;
      const {alphabet, letterInfos, inputSubstitution} = self.props.scope;
      const letterInfo = letterInfos[selectedLetterPos];
      const bigram = letterInfo.bigram;
      const side = sideOfStatus[letterInfo.status];
      const substPair = getBigramSubstPair(inputSubstitution, bigram) || nullSubstPair;
      return <EditPairDialog
         alphabet={alphabet} bigram={bigram} editPair={editPair} substPair={substPair}
         onOk={validateDialog} onCancel={cancelDialog} onChange={setEditPair} focusSide={side} />;
   };

   const renderCell = function (alphabet, cell) {
      const classes = ['bigramLetter', getQualifierClass(cell.q)];
      return <span className={classnames(classes)}>{getCellLetter(alphabet, cell, true)}</span>;
   };

   const renderBigramSubstSide = function (alphabet, bigram, inputPair, outputPair, side) {
      const inputCell = inputPair.dst[side];
      const outputCell = outputPair.dst[side];
      const hasConflict = testConflict(inputCell, outputCell);
      const isLocked = outputCell.q === "locked";
      return (
         <div className={classnames(['substitutionPair', hasConflict && 'substitutionConflict'])}>
            <span className='originLetter'>
               {renderCell(alphabet, inputCell)}
            </span>
            <span className='newLetter'>
               {renderCell(alphabet, outputCell)}
            </span>
            <span className='substitutionLock'>
               {isLocked ? <i className='fa fa-lock'></i> : ' '}
            </span>
         </div>
      );
   };

   const renderLiteralSubstSide = function (letter) {
      return (
         <div className='substitutionPair'>
            <div className='character'>{letter}</div>
            <div className='character'>{letter}</div>
            <div className='character'> </div>
         </div>
      );
   };

   const renderSubstBigrams = function () {
      const {alphabet, inputCipheredText, inputSubstitution, outputSubstitution, letterInfos, lineStartCols} = self.props.scope;
      const {selectedLetterPos} = self.state;
      const selectedBigramPos = selectedLetterPos && letterInfos[selectedLetterPos].iBigram;
      let line = 0;
      const elements = [];
      for (let iLetter = 0; iLetter < inputCipheredText.length; iLetter++) {
         if (lineStartCols[line + 1] === iLetter) {
            elements.push(<hr/>);
            line++;
         }
         const letter = inputCipheredText[iLetter];
         const {bigram, status, iBigram}  = letterInfos[iLetter];
         const side = sideOfStatus[status];
         let substBlock;
         if (side !== undefined) {
            const inputPair = getBigramSubstPair(inputSubstitution, bigram) || nullSubstPair;
            const outputPair = getBigramSubstPair(outputSubstitution, bigram) || nullSubstPair;
            substBlock = renderBigramSubstSide(alphabet, bigram, inputPair, outputPair, side);
         } else {
            substBlock = renderLiteralSubstSide(letter);
         }
         const bigramClasses = [
            'letterSubstBloc',
            'letterStatus-' + status,
            iBigram !== undefined && selectedBigramPos === iBigram && 'selectedBigram'
         ];
         elements.push(
            <div className={classnames(bigramClasses)} onClick={clickBigram} data-i={iLetter}>
               <div className='cipheredLetter'>{letter}</div>
               {substBlock}
            </div>
         );
      }
      return <div className='y-scrollBloc'>{elements}</div>;
   };

   self.render = function () {
      const {editPair} = self.state;
      const {toolState, scope} = self.props;
      const {nConflicts} = scope;
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
                  <strong>Nombre de conflits entre les substitutions :</strong> {nConflicts}<br/>
                  {renderSubstBigrams()}
               </div>
            </div>
         </div>
      );
   };

}, self => {
   return {
      editPair: undefined,
      selectedLetterPos: undefined
   };
});

export const compute = function (toolState, scope) {
   const {substitutionEdits, nbLettersPerRow} = toolState;
   const {alphabet, inputCipheredText, inputSubstitution} = scope;
   scope.letterInfos = getTextAsBigrams(inputCipheredText, alphabet).letterInfos;
   scope.lineStartCols = getStringWrapping(inputCipheredText, nbLettersPerRow, alphabet);
   scope.outputSubstitution = applySubstitutionEdits(alphabet, inputSubstitution, substitutionEdits);
   scope.nConflicts = countAllSubstitutionConflicts(inputSubstitution, scope.outputSubstitution, alphabet);
};

export default self => {
   self.state = {
      nbLettersPerRow: 29
   };
   self.Component = Component;
   self.compute = compute;
};
