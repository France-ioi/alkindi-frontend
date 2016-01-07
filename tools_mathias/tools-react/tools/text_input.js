import {PureComponent} from '../utils';
import {Variables} from '../ui/variables';
import * as Python from '../python';

export const Component = PureComponent(self => {

   /*
      props:
         scope:
            alphabet
            text
         toolState:
            outputVariable
   */

   self.render = function() {
      const {outputVariable} = self.props.toolState;
      const {text} = self.props.scope;
      const inputVars = [];
      const outputVars = [{label: "Texte chiffré", name: outputVariable}];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputVariable}/>
                     <Python.StrLit value={text}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <Variables inputVars={inputVars} outputVars={outputVars} />
               <div className='grillesSection'>
                  <div className='y-scrollBloc'>{text}</div>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   scope.output = scope.text;
};

export default self => {
   self.state = {
      outputVariable: undefined
   };
   self.Component = Component;
   self.compute = compute;
};
