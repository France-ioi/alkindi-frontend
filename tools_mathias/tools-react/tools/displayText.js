import {PureComponent} from '../utils';
import {Variables} from '../ui/variables';
import * as Python from '../python';

export default PureComponent(self => {

   /*
      props:
         alphabet
         cipheredText
         outputCipheredTextVariable
   */

   const renderInstructionPython = function () {
      const {outputCipheredTextVariable, cipheredText} = self.props;
      return (
         <Python.Assign>
            <Python.Var name={outputCipheredTextVariable}/>
            <Python.StrLit value={cipheredText}/>
         </Python.Assign>
      );
   };

   self.render = function() {
      const inputVars = [];
      const outputVars = [{label: "Texte chiffré", name: self.props.outputCipheredTextVariable}];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>{renderInstructionPython()}</span>
            </div>
            <div className='panel-body'>
               <Variables inputVars={inputVars} outputVars={outputVars} />
               <div className='grillesSection'>
                  <div className='y-scrollBloc'>{self.props.cipheredText}</div>
               </div>
            </div>
         </div>
      );
   };

});
