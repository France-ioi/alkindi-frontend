import {PureComponent} from './utils';

export const OkCancel = PureComponent(self => {
   /* Props:
      onOk
      onCancel
   */
   self.render = function () {
      let {onOk, onCancel} = self.props;
      return (
         <div className='text-center'>
            <button type='button' className='btn-tool' onClick={onOk}>Valider</button>
            &nbsp;&nbsp;&nbsp;
            <button type='button' className='btn-tool' onClick={onCancel}>Annuler</button>
         </div>
      );
   };
});
