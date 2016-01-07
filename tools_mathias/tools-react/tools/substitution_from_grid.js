import classnames from 'classnames';

import {PureComponent} from '../utils';
import {Variables} from '../ui/variables';
import {Grid} from '../ui/grid';
import {Substitution} from '../ui/substitution';
import {OkCancel} from '../ui/ok_cancel';
import * as Python from '../python';
import {put, at, getCellLetter, applyGridEdit, getSubstitutionFromGridCells} from '../tools';

export const Component = PureComponent(self => {

   /*
      props:
         toolState
            editGrid
            inputGridVariable
            outputGridVariable
            outputSubstitutionVariable
         setToolState
         scope
            alphabet
            inputGrid
            outputGrid
            outputSubstitution
   */

   const getEditCell = function (row, col) {
      const {editGrid} = self.props.toolState;
      if (row >= editGrid.length) {
         return {};
      }
      const editRow = editGrid[row];
      if (col >= editGrid.length) {
         return {};
      }
      return editRow[col];
   };

   const clickGridCell = function (row, col) {
      const {inputGrid} = self.props.scope;
      const inputCell = inputGrid[row][col];
      const {q} = inputCell;
      if (q === 'confirmed' || q === 'hint') {
         self.setState({
            editState: "invalid",
            selectedRow: row,
            selectedCol: col
         });
      } else {
         self.setState({
            editState: "preparing",
            selectedRow: row,
            selectedCol: col,
            editCell: getEditCell(row, col)
         });
      }
   };

   const changeLetter = function (event) {
      const {editCell} = self.state;
      const letter = event.target.value;
      self.setState({editCell: {...editCell, letter}});
   };

   const toggleLock = function () {
      const {editCell} = self.state;
      const locked = !editCell.locked;
      self.setState({editCell: {...editCell, locked}});
   };

   const validateDialog = function () {
      const {toolState, setToolState, scope} = self.props;
      const {alphabet} = scope;
      const {editGrid} = toolState;
      const {editCell, selectedRow, selectedCol} = self.state;
      const letter = editCell.letter.trim().toUpperCase();  // XXX
      let edit;
      if (letter === '') {
         edit = undefined;
      } else {
         const rank = alphabet.ranks[letter];
         if (rank === undefined) {
            alert(letter + " n'est pas une valeur possible de la grille");
            return;
         }
         edit = editCell;
      }
      setToolState({
         editGrid: at(selectedRow, at(selectedCol, put(edit)))(editGrid)
      });
      cancelDialog();
   };

   const cancelDialog = function () {
      self.setState({
         editState: undefined,
         selectedRow: undefined,
         selectedCol: undefined,
         editCell: undefined
      });
   };

   const renderInstructionPython = function () {
      const {toolState, scope} = self.props;
      const {outputSubstitutionVariable, inputGridVariable} = toolState;
      const {alphabet, inputGrid} = scope;
      const renderCell = function (cell) {
         return "'" + getCellLetter(alphabet, cell) + "'";
      };
      // XXX afficher changeGrid dans le code python
      return (
         <Python.Assign>
            <Python.Var name={outputSubstitutionVariable}/>
            <Python.Call name="substitutionDepuisGrille">
               <Python.Var name={inputGridVariable}/>
               <Python.Grid grid={inputGrid} renderCell={renderCell} />
            </Python.Call>
         </Python.Assign>
      );
   };

   const renderGrid = function() {
      const {scope} = self.props;
      const {alphabet, outputGrid} = scope;
      const {selectedRow, selectedCol} = self.state;
      return <Grid alphabet={alphabet} grid={outputGrid} selectedRow={selectedRow} selectedCol={selectedCol} onClick={clickGridCell} />;
   };

   const renderSubstitution = function () {
      const {scope} = self.props;
      const {alphabet, outputSubstitution} = scope;
      return <Substitution alphabet={alphabet} substitution={outputSubstitution}/>;
   };

   const renderPreparingEditCell = function() {
      const {scope} = self.props;
      const {editCell, selectedRow, selectedCol} = self.state;
      const {letter, locked} = editCell;
      const {alphabet, inputGrid} = scope;
      const inputCell = inputGrid[selectedRow][selectedCol];
      const buttonClasses = ['btn-toggle', locked && "locked"];
      const iconClasses = ['fa', locked ? "fa-toggle-on" : "fa-toggle-off"];
      return (
         <div className='dialog'>
            <div className='dialogLine'>
                  <span className='dialogLabel'>Valeur d'origine :</span>
                  <span>{getCellLetter(alphabet, inputCell)}</span>
            </div>
            <div className='dialogLine'>
                  <span className='dialogLabel'>Nouvelle valeur :</span>
                  <span className='dialogLetterSubst'>
                     <input type='text' maxLength='1' value={letter} onChange={changeLetter} />
                  </span>
            </div>
            <div className='dialogLine'>
                  <span className='dialogLabel'>{'\u00a0'}</span>
                  <span className='dialogLock'>
                     <span className='substitutionLock'>
                        {locked ? <i className='fa fa-lock'/> : '\u00a0'}
                     </span>
                  </span>
            </div>
            <div className='dialogLine'>
                  <span className='dialogLabel'>Bloquer / débloquer :</span>
                  <span>
                     <button type='button' className={classnames(buttonClasses)} onClick={toggleLock}>
                        <i className={classnames(iconClasses)} />
                     </button>
                  </span>
            </div>
            <OkCancel onOk={validateDialog} onCancel={cancelDialog}/>
         </div>
      );
   };

   const renderInvalidEditCell = function () {
      return <div className='dialog'>Le contenu de cette case est déjà confirmé</div>;
   };

   self.render = function () {
      const {outputGridVariable, outputSubstitutionVariable, inputGridVariable} = self.props.toolState;
      const inputVars = [
         {label: "Grille playFair", name: inputGridVariable}
      ];
      const outputVars = [
         {label: "Grille éditée", name: outputGridVariable},
         {label: "Substitution générée", name: outputSubstitutionVariable}
      ];
      const {editState} = self.state;
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'><span className='code'>
               {renderInstructionPython()}
            </span></div>
            <div className='panel-body'>
               {editState === 'preparing' && renderPreparingEditCell.apply(this, arguments)}
               {editState === 'invalid' && renderInvalidEditCell()}
               <Variables inputVars={inputVars} outputVars={outputVars} />
               <div className='grillesSection'>
                  <div className='blocGrille'>
                     Grille éditée :<br/>
                     {renderGrid()}
                  </div>
                  <div className='blocGrille'>
                     Substitution de bigrammes générée :<br/>
                     {renderSubstitution()}
                  </div>
               </div>
            </div>
         </div>
      );
   };

}, self => {
   return {
      editState: undefined,
      selectedCol: undefined,
      selectedRow: undefined,
      editCell: undefined,
   };
});

export const compute = function (toolState, scope) {
   const {editGrid} = toolState;
   const {alphabet, inputGrid} = scope;
   scope.outputGrid = applyGridEdit(alphabet, inputGrid, editGrid);
   scope.outputSubstitution = getSubstitutionFromGridCells(scope.outputGrid);
};

export default self => {
   self.state = {
      editGrid: [[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}]],
      inputGridVariable: undefined,
      outputGridVariable: undefined,
      outputSubstitutionVariable: undefined
  };
  self.Component = Component;
  self.compute = compute;
};
