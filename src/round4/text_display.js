import React from 'react';
import EpicComponent from 'epic-component';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {c, cellsFromString} from './common';

export const Component = EpicComponent(self => {

   /*
      props:
         scope:
            inputText
         toolState:
            outputTextVariable
   */

   self.render = function() {
      const {outputTextVariable} = self.props.toolState;
      const {inputText} = self.props.scope;
      const inputVars = [];
      const outputVars = [{label: "Texte chiffré", name: outputTextVariable}];
      const lines = inputText.split('\n');
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputTextVariable}/>
                     <Python.StrLit value={inputText.substr(0, 40)+'…'}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               {false && <Variables inputVars={inputVars} outputVars={outputVars} />}
               <div className="clearfix">
                  <textarea className={c('textDisplay')} wrap='off' value={inputText} readOnly={true}/>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {inputText, alphabet} = scope;
   const cells = cellsFromString(inputText, alphabet);
   scope.outputText = {cells, alphabet};
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
