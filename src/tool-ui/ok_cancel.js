import React from 'react';
import {PureComponent} from '../utils/generic';

export const OkCancel = PureComponent(self => {
   /* Props:
      onOk
      onCancel
   */
   self.render = function () {
      let {onOk, onCancel} = self.props;
      if (!onCancel) {
         return (
            <div className='text-center'>
               <button type='button' className='btn-tool' onClick={onOk}>OK</button>
            </div>
         );
      }
      return (
         <div className='text-center'>
            <button type='button' className='btn-tool' onClick={onOk}>Valider</button>
            {'   '}
            <button type='button' className='btn-tool' onClick={onCancel}>Annuler</button>
         </div>
      );
   };
});

export default OkCancel;
