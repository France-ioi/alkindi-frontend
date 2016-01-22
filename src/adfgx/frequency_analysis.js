import React from 'react';
import EpicComponent from 'epic-component';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';

export const Component = EpicComponent(self => {

   self.render = function() {
      // Button to reset substitution to match order of bigrams frequencies
      // with order of letter frequencies in french.
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <p>TODO</p>
            </div>
            <div className='panel-body'>
               <p>TODO</p>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   // TODO
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
