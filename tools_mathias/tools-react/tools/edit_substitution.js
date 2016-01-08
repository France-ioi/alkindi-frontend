import classnames from 'classnames';

import {PureComponent} from '../utils';
import {Variables} from '../ui/variables';
import {OkCancel} from '../ui/ok_cancel';
import * as Python from '../python';
import {getCellLetter, getQualifierClass} from '../tools';
import {getTextBigrams, getMostFrequentBigrams, getBigramSubstPair,
        countAllSubstitutionConflicts, applySubstitutionEdits} from '../bigram_utils';
import EditPairDialog from '../ui/edit_pair_dialog';
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
            inputCipheredText
            inputSubstitution
            outputSubstitution
   */

   const clickBigram = function (event) {
      const {substitutionEdits, editable} = self.props.toolState;
      if (!editable)
         return;
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

   const validateDialog = function (checkedEditPair) {
      const {selectedPos, editPair} = self.state;
      const {alphabet, mostFrequentBigrams} = self.props.scope;
      const {v} = mostFrequentBigrams[selectedPos];
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
         editState: undefined,
         editPair: undefined,
         selectedPos: undefined
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

   const renderCell = function (alphabet, cell) {
      const classes = ['bigramLetter', getQualifierClass(cell.q)];
      return <span className={classnames(classes)}>{getCellLetter(alphabet, cell, true)}</span>;
   };

   const renderBigram = function (bigram) {
      const {v} = bigram;
      return <span>{v.charAt(0)+'\u00a0'+v.charAt(1)}</span>;
   };

   const setEditPair = function (editPair) {
      self.setState({editPair});
   };

   const renderEditPair = function () {
      const {selectedPos, editPair} = self.state;
      const {alphabet, mostFrequentBigrams, inputSubstitution} = self.props.scope;
      const bigram = mostFrequentBigrams[selectedPos];
      const substPair = getBigramSubstPair(inputSubstitution, bigram) || nullSubstPair;
      return <EditPairDialog
         alphabet={alphabet} bigram={bigram} editPair={editPair} substPair={substPair}
         onOk={validateDialog} onCancel={cancelDialog} onChange={setEditPair} />;
   };

   const renderSubstBigrams = function (inputCipheredText, inputSubstitution, outputSubstitution) {
      return <div>XXX le texte ici</div>;
   };

   self.render = function () {
      const {editPair} = self.state;
      const {toolState, scope} = self.props;
      const {inputCipheredTextVariable, inputSubstitutionVariable, outputSubstitutionVariable} = toolState;
      const {alphabet, inputCipheredText, inputSubstitution, outputSubstitution} = scope;
      const nConflicts = countAllSubstitutionConflicts(inputSubstitution, outputSubstitution, alphabet);
      const textBigrams = renderSubstBigrams(inputCipheredText, inputSubstitution, outputSubstitution);
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
                  {textBigrams}
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
   const {substitutionEdits} = toolState;
   const {alphabet, inputCipheredText, inputSubstitution} = scope;
   scope.textBigrams = getTextBigrams(inputCipheredText, alphabet);
   scope.outputSubstitution = applySubstitutionEdits(alphabet, inputSubstitution, substitutionEdits);
};

export default self => {
   self.state = {
   };
   self.Component = Component;
   self.compute = compute;
};
