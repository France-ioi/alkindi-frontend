import {PureComponent} from './utils';
import {Variables} from './variables';

export default PureComponent(self => {

   /*
      props:
         alphabet
         cipheredText
         outputCipheredTextVariable
   */

   const renderInstructionPython = function () {
      return <span>
         <span className='code-var'>{self.props.outputCipheredTextVariable}</span> = '<span>{self.props.cipheredText}</span>'
      </span>;
   };

   self.render = function() {
      const inputVars = [];
      const outputVars = [{label: "Texte chiffré", name: self.props.outputCipheredTextVariable}];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'><span className='code'>{renderInstructionPython()}</span></div>
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
