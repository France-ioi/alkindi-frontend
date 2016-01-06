import classnames from 'classnames';
import range from 'node-range';

import {PureComponent} from './utils';
import {Variables} from './variables';
import {Alphabet} from './alphabet';
import {Grid, GridPython} from './grid';
import {OkCancel} from './ok_cancel';
import {getCellLetter, getLetterQualifiersFromGrid} from './tools';

export default PureComponent(self => {

   /* props:
         alphabet
         gridCells
         score
         outputGridVariable
         getQueryCost(query)
         getHint(query, callback)
   */

   const validateDialog = function() {
      let {hintQuery} = self.state;
      self.setState({hintState: "waiting"});
      self.props.getHint(hintQuery, function (err) {
         // TODO: handle err
         self.setState({hintState: "received"});
      });
   };

   const cancelDialog = function() {
      self.setState({
         hintQuery: undefined,
         hintState: "idling"
      });
   };

   const hintAlreadyObtained = function () {
      self.setState({
         hintQuery: undefined,
         hintState: "invalid"
      });
   };

   const prepareQuery = function (query) {
      self.setState({
         hintQuery: query,
         hintState: "preparing"
      });
   };

   const clickGridCell = function (row, col) {
      if (self.state.hintState === "waiting") {
         return;
      }
      if (self.props.gridCells[row][col].q === "confirmed") {
         hintAlreadyObtained();
      } else {
         prepareQuery({type:'grid', row: row, col: col});
      }
   };

   const clickGridAlphabet = function (rank) {
      if (self.state.hintState === "waiting") {
         return;
      }
      const qualifiers = getLetterQualifiersFromGrid(self.props.gridCells, self.props.alphabet);
      if (qualifiers[rank] === "confirmed") {
         hintAlreadyObtained();
      } else {
         prepareQuery({type: 'alphabet', rank: rank});
      }
   };

   const renderInstructionPython = function() {
      const {outputGridVariable, alphabet, gridCells} = self.props;
      const renderCell = function (cell) {
         return "'" + getCellLetter(alphabet, cell) + "'";
      };
      return (
         <span><span className='code-var'>{outputGridVariable}</span> = <GridPython grid={gridCells} renderCell={renderCell} /></span>
      );
   };

   const renderGrid = function() {
      const {alphabet, gridCells} = self.props;
      let selectedRow;
      let selectedCol;
      const query = self.state.hintQuery;
      if (query !== undefined && query.type === 'grid') {
         selectedRow = query.row;
         selectedCol = query.col;
      }
      return <Grid alphabet={alphabet} grid={gridCells} selectedRow={selectedRow} selectedCol={selectedCol} onClick={clickGridCell} />;
   };

   const renderAlphabet = function () {
      const {alphabet, gridCells} = self.props;
      const {hintQuery} = self.state;
      let selectedLetterRank;
      if (hintQuery !== undefined && hintQuery.type === 'alphabet') {
         selectedLetterRank = hintQuery.rank;
      }
      const qualifiers = getLetterQualifiersFromGrid(gridCells, alphabet);
      return <Alphabet alphabet={alphabet} qualifiers={qualifiers} onClick={clickGridAlphabet} selectedLetterRank={selectedLetterRank} />;
   }

   const renderHintQuery = function () {
      const {hintState} = self.state;
      if (hintState === "preparing") {
         const {score, getQueryCost} = self.props;
         const {hintQuery} = self.state;
         const cost = getQueryCost(hintQuery);
         return (
            <div className='dialog'>
               <div className='dialogLine'>
                  <strong>Indice demandé :</strong>
                  {hintQuery.type === "grid"
                   ? <span>lettre à la ligne <span className='dialogIndice'>{hintQuery.row + 1}</span>, colonne <span className='dialogIndice'>{hintQuery.col + 1}</span> de la grille.</span>
                   : <span>position de la lettre <span className='dialogIndice'>{self.props.alphabet[hintQuery.rank]}</span> dans la grille</span>}
               </div>
               <div className='dialogLine'>
                  <strong>Coût :</strong> {cost} points
               </div>
               <div className='dialogLine'>
                  <strong>Score disponible :</strong> {score} points
               </div>
               <OkCancel onOk={validateDialog} onCancel={cancelDialog}/>
            </div>
         );
      } else if (hintState === "waiting") {
         return <div className='dialog'>En attente de réponse du serveur</div>;
      } else if (hintState === "received") {
         return (
            <div className='dialog'>
               Indice obtenu, grille mise à jour
               <button type='button' className='btn-tool' onClick={cancelDialog}>OK</button>
            </div>
         );
      } else if (hintState === "invalid") {
         return <div className='dialog'>Cet indice a déjà été obtenu</div>;
      }
      return "";
   };

   self.render = function() {
      const {outputGridVariable, score, getQueryCost} = self.props;
      const outputVars = [{label: "Grille enregistrée", name: outputGridVariable}];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>{renderInstructionPython()}</span>
            </div>
            <div className='panel-body'>
               {renderHintQuery()}
               <Variables outputVars={outputVars} />
               <div className='grillesSection'>
                  <p className='title'>Deux types d'indices sont disponibles :</p>
                  <div className='blocGrille'>
                     <p>Révéler une case : {getQueryCost({type: "grid"})} points</p>
                     {renderGrid()}
                  </div>
                  <div className='blocGrille'>
                     <p>Révéler la position d'une lettre : {getQueryCost({type: "alphabet"})} points</p>
                     {renderAlphabet()}
                  </div>
               </div>
               <div className='score'><strong>Score disponible :</strong> {score} points</div>
            </div>
         </div>
      );
   };

}, self => {
   return {
      hintQuery: undefined,
      hintValues: undefined,
      hintState: "idle"
   };
});
