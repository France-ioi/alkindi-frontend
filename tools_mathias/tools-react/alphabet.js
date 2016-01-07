import classnames from 'classnames';
import range from 'node-range';

import {PureComponent} from './utils';

export const Alphabet = PureComponent(self => {

   const onClick = function (event) {
      const element = event.currentTarget;
      const letterRank = parseInt(element.getAttribute('data-letter-rank'));
      self.props.onClick(letterRank);
   };

   self.render = function () {
      const {alphabet, qualifiers, selectedLetterRank} = self.props;
      const renderCell = function (letterRank) {
         if (letterRank === 22) {
            return <td className='qualifier-disabled'></td>;
         }
         if (letterRank > 22) { // no W
            letterRank--;
         }
         const classes = ["qualifier-" + qualifiers[letterRank]];
         if (selectedLetterRank === letterRank) {
            classes.push("cell-query");
         }
         return <td className={classnames(classes)} onClick={onClick} data-letter-rank={letterRank}>{alphabet[letterRank]}</td>;
      };
      const renderRow = function (row) {
         return (
            <table className='playFairAlphabet'>
               <tbody>
                  <tr>{range(0, 13).map(col => renderCell(row * 13 + col))}</tr>
               </tbody>
            </table>
         );
      };
      return <div>{renderRow(0)}<br/>{renderRow(1)}</div>;
   };

});
