import classnames from 'classnames';

import {PureComponent} from '../utils';
import {Variables} from '../ui/variables';
import * as Python from '../python';
import {getCellLetter, getQualifierClass, getCellsWrapping} from '../tools';
import {getTextAsBigrams, applySubstitution} from '../bigram_utils';

export const Component = PureComponent(self => {

   /*
      props:
         toolState:
            inputTextVariable
            inputSubstitutionVariable
            outputTextVariable
         scope:
            alphabet
            inputText
            inputSubstitution
            outputText
   */

   const renderInstructionPython = function () {
      const {outputTextVariable, inputSubstitutionVariable, inputTextVariable} = self.props.toolState;
      return (
         <Python.Assign>
            <Python.Var name={outputTextVariable}/>
            <Python.Call name="appliqueSubstitution">
               <Python.Var name={inputTextVariable}/>
               <Python.Var name={inputSubstitutionVariable}/>
            </Python.Call>
         </Python.Assign>
      );
   };

   const renderVariables = function () {
      const {inputTextVariable, inputSubstitutionVariable, outputTextVariable} = self.props.toolState;
      const inputVars = [
         {label: "Texte chiffré", name: inputTextVariable},
         {label: "Substitution appliquée", name: inputSubstitutionVariable}
      ];
      const outputVars = [
         {label: "Texte déchiffré", name: outputTextVariable}
      ];
      return <Variables inputVars={inputVars} outputVars={outputVars} />;
   };

   const renderCell = function (alphabet, cell) {
      const classes = ['substituedLetter', getQualifierClass(cell.q)];
      const letter = 'l' in cell ? getCellLetter(alphabet, cell, true) : cell.c;
      return <span className={classnames(classes)}>{letter}</span>;
   };

   const renderText = function () {
      const {alphabet, outputText, lineStartCols} = self.props.scope;
      let line = 0;
      const elements = [];
      for (let iCell = 0; iCell < outputText.length; iCell++) {
         if (lineStartCols[line + 1] === iCell) {
            elements.push(<hr/>);
            line++;
         }
         const cell = outputText[iCell];
         elements.push(renderCell(alphabet, cell));
      }
      return <div className='y-scrollBloc'>{elements}</div>;
   };

   self.render = function () {
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  {renderInstructionPython()}
               </span>
            </div>
            <div className='panel-body'>
               {renderVariables()}
               {renderText()}
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
   const {nbLettersPerRow} = toolState;
   const {alphabet, inputSubstitution, inputText} = scope;
   scope.letterInfos = getTextAsBigrams(inputText, alphabet).letterInfos;
   scope.outputText = applySubstitution(alphabet, inputSubstitution, scope.letterInfos);
   scope.lineStartCols = getCellsWrapping(scope.outputText, nbLettersPerRow);
};

export default self => {
   self.state = {
      nbLettersPerRow: 29
   };
   self.Component = Component;
   self.compute = compute;
};
