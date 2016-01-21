import React from 'react';

import {PureComponent} from '../utils/generic';

export const Variable = PureComponent(self => {
   self.render = function () {
      const {label, name} = self.props;
      return (
         <div>
            <span className='variable-label'>{label} : </span>
            <div className='code variable-name'>{name}</div>
         </div>
      );
   };
});

export const Variables = PureComponent(self => {
   self.render = function () {
      const {inputVars, outputVars} = self.props;
      return (
         <div className='playfair-variables'>
            {inputVars && inputVars.length > 0 &&
             <div className='variable-entree variable-informations'>
               <span>Variables d'entrée :</span>
               {inputVars.map(function (v, i) {
                  return <Variable key={i} label={v.label} name={v.name}/>;
               })}
            </div>}
            {outputVars && outputVars.length > 0 &&
             <div className='variable-sortie variable-informations'>
               <span>Variables de sortie :</span>
               {outputVars.map(function (v, i) {
                  return <Variable key={i} label={v.label} name={v.name}/>;
               })}
            </div>}
         </div>
      );
   };
});

export default Variables;
