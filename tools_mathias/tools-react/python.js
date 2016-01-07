import intersperse from 'intersperse';

import {PureComponent} from './utils';

export const StrLit = PureComponent(self => {
   /* Props:
         value
   */
   self.render = function () {
      return <span>'{self.props.value}'</span>;
   };
});

export const Var = PureComponent(self => {
   /* Props:
         name
   */
   self.render = function () {
      return <span className='code-var'>{self.props.name}</span>;
   };
});


export const Assign = PureComponent(self => {
   /* Props:
         children
   */
   self.render = function () {
      const {children} = self.props;
      return <span>{children[0]}{' = '}{children[1]}</span>;
   };
});

export const Call = PureComponent(self => {
   /* Props:
         name
         children
   */
   self.render = function () {
      return (
         <span>
            {self.props.name}
            {'('}
            {intersperse(self.props.children, ', ')}
         </span>
      );
   };
});

export const Grid = PureComponent(self => {
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
