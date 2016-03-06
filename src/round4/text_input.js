import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {c, cellsFromString} from './common';

export const Component = EpicComponent(self => {

   const setText = function (event) {
      self.props.setToolState({text: event.target.value});
   };

   const resetText = function () {
      const {inputText} = self.props.scope;
      self.props.setToolState({text: inputText});
   };

   self.render = function () {
      const {inputTextVariable, outputTextVariable, text} = self.props.toolState;
      const {inputText, invalidBigram, invalidLiteral} = self.props.scope;
      const inputVars = [];
      const outputVars = [{label: "Texte édité", name: outputTextVariable}];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputTextVariable}/>
                     <Python.StrLit value={(text||inputText).substr(0, 40)+'…'}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <div className='pull-right'>
                  <Button onClick={resetText}>
                     {'réinitialiser avec '}
                     <span className='code'>{inputTextVariable}</span>
                  </Button>
               </div>
               {false && <Variables inputVars={inputVars} outputVars={outputVars} />}
               <textarea className={c('textInput')} wrap='off' value={(text||inputText)} onChange={setText}/>
               {invalidBigram && <p>Le bigramme '{invalidBigram.symbol}' (ligne {invalidBigram.line}, colonne {invalidBigram.column}) est invalide : hors de la plage 01…80.</p>}
               {invalidLiteral && <p>Le caractère '{invalidLiteral.symbol}' (ligne {invalidLiteral.line}, colonne {invalidLiteral.column}) est invalide : ni blanc ni chiffre.</p>}
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {inputText, alphabet} = scope;
   const text = toolState.text || inputText;
   const cells = cellsFromString(text, alphabet);
   scope.outputText = {alphabet, cells};
   cells.forEach(function (cell) {
      if (cell.rank === undefined) {
         const {symbol} = cell;
         if (symbol.length === 2 && !scope.invalidBigram) {
            scope.invalidBigram = cell;
         }
         if (symbol.length === 1 && !/[ \t\r\n]/.test(cell.symbol) && !scope.invalidLiteral) {
            scope.invalidLiteral = cell;
         }
      }
   });
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
