import React from 'react';
import EpicComponent from 'epic-component';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {cellsFromString, renderText} from './common';

export const Component = EpicComponent(self => {

   /*
      props:
         scope:
            alphabet
            text
         toolState:
            outputTextVariable
   */

   self.render = function() {
      const {outputTextVariable} = self.props.toolState;
      const {text, outputText} = self.props.scope;
      const inputVars = [];
      const outputVars = [{label: "Texte chiffré", name: outputTextVariable}];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputTextVariable}/>
                     <Python.StrLit value={text}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <Variables inputVars={inputVars} outputVars={outputVars} />
               <div className='adfgx-text-input'>{renderText(outputText)}</div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {alphabet, text} = scope;
   const cells = cellsFromString(text, alphabet);
   scope.outputText = {alphabet, cells};
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
