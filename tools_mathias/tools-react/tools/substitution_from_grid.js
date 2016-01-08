import classnames from 'classnames';

import {PureComponent} from '../utils';
import {Variables} from '../ui/variables';
import {Grid} from '../ui/grid';
import {Substitution} from '../ui/substitution';
import {OkCancel} from '../ui/ok_cancel';
import * as Python from '../python';
import {put, at, getCellLetter, applyGridEdit, getSubstitutionFromGridCells} from '../tools';
import EditCellDialog from '../ui/edit_cell_dialog';

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
      self.setState({
         selectedRow: row,
         selectedCol: col,
         editCell: getEditCell(row, col)
      });
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

   const setEditCell = function (editCell) {
      self.setState({editCell});
   };

   const renderEditCell = function () {
      const {alphabet, inputGrid} = self.props.scope;
      const {editCell, selectedRow, selectedCol} = self.state;
      const initialCell = inputGrid[selectedRow][selectedCol];
      return <EditCellDialog
         alphabet={alphabet} initialCell={initialCell} editCell={editCell}
         onOk={validateDialog} onCancel={cancelDialog} onChange={setEditCell} />;
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
      const {editCell} = self.state;
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'><span className='code'>
               {renderInstructionPython()}
            </span></div>
            <div className='panel-body'>
               {editCell && renderEditCell()}
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
