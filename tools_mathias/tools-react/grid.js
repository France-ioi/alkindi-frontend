import classnames from 'classnames';
import range from 'node-range';

import {PureComponent} from './utils';
import {getCellLetter} from './tools';

export const Grid = PureComponent(self => {
   /* Props:
         alphabet
         grid
         selectedRow
         selectedCol
         onClick
   */;

   const onClick = function (event) {
      const element = event.currentTarget;
      const row = parseInt(element.getAttribute('data-row'));
      const col = parseInt(element.getAttribute('data-col'));
      self.props.onClick(row, col);
   };

   self.render = function () {
      const {alphabet, grid, selectedRow, selectedCol, testConflict} = self.props;
      const nbRows = grid.length;
      const nbCols = grid[0].length;
      const renderCell = function (row, col) {
         const cell = grid[row][col];
         const classes = ["qualifier-" + cell.q];
         if (selectedRow === row && selectedCol === col) {
            classes.push("cell-query");  // XXX cell-selected
         }
         if (testConflict !== undefined && testConflict(row, col)) {
            classes.push("cell-conflict");
         }
         let letter = getCellLetter(alphabet, cell);
         return <td className={classnames(classes)} onClick={onClick} data-row={row} data-col={col}>{letter}</td>;
      };
      const renderRow = function (row) {
         return <tr>{range(0, nbCols).map(col => renderCell(row, col))}</tr>;
      };
      return (
         <table className='playFairGrid'>
            <tbody>
               {range(0, nbRows).map(renderRow)}
            </tbody>
         </table>
      );
   };

});

export const GridPython = PureComponent(self => {
   /* Props:
         grid
         renderCell
   */
   self.render = function () {
      const {grid, renderCell} = self.props;
      const nbRows = grid.length;
      const nbCols = grid[0].length;
      let strPython = "[";
      for (let row = 0; row < nbRows; row++) {
         if (row !== 0)
            strPython += ", "
         strPython += "[";
         for (let col = 0; col < nbCols; col++) {
            if (col != 0) {
               strPython += ", ";
            }
            const cell = grid[row][col];
            strPython += renderCell(grid[row][col]);
         }
         strPython += "]";
      }
      strPython += "];";
      return <span>{strPython}</span>;
   };
});
