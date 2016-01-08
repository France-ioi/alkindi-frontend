import React from 'react';
import intersperse from 'intersperse';

import {PureComponent} from '../utils/generic';

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
      const args = self.props.children.filter(arg => arg);
      return (
         <span>
            {self.props.name}
            {'('}
            {intersperse(args, ', ')}
            {')'}
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
            strPython += renderCell(grid[row][col]);
         }
         strPython += "]";
      }
      strPython += "];";
      return <span>{strPython}</span>;
   };
});
