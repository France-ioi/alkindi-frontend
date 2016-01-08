import React from 'react';

import {PureComponent} from '../utils/generic';
import {getCellLetter} from '../utils/cell';
import {getLetterQualifiersFromGrid} from '../utils/grid';

import {Variables} from '../ui/variables';
import {Alphabet} from '../ui/alphabet';
import {Grid} from '../ui/grid';
import {OkCancel} from '../ui/ok_cancel';
import * as Python from '../ui/python';

export const Component = PureComponent(self => {

   /*
      props:
         scope:
            alphabet
            hintsGrid
            score
            getQueryCost(query)
            getHint(query, callback)
         toolState:
            outputGridVariable
   */

   const validateDialog = function() {
      let {hintQuery} = self.state;
      self.setState({hintState: "waiting"});
      self.props.scope.getHint(hintQuery, function (err) {
         self.setState({hintState: err ? "error" : "received"});
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
      if (self.props.scope.hintsGrid[row][col].q === "hint") {
         hintAlreadyObtained();
      } else {
         prepareQuery({type:'grid', row: row, col: col});
      }
   };

   const clickGridAlphabet = function (rank) {
      if (self.state.hintState === "waiting") {
         return;
      }
      const {alphabet, hintsGrid} = self.props.scope;
      const qualifiers = getLetterQualifiersFromGrid(hintsGrid, alphabet);
      if (qualifiers[rank] === "confirmed") {
         hintAlreadyObtained();
      } else {
         prepareQuery({type: 'alphabet', rank: rank});
      }
   };

   const renderInstructionPython = function() {
      const {alphabet, hintsGrid} = self.props.scope;
      const {outputGridVariable} = self.props.toolState;
      const renderCell = function (cell) {
         return "'" + getCellLetter(alphabet, cell) + "'";
      };
      return (
         <Python.Assign>
            <Python.Var name={outputGridVariable}/>
            <Python.Grid grid={hintsGrid} renderCell={renderCell} />
         </Python.Assign>
      );
   };

   const renderGrid = function() {
      const {alphabet, hintsGrid} = self.props.scope;
      let selectedRow;
      let selectedCol;
      const query = self.state.hintQuery;
      if (query !== undefined && query.type === 'grid') {
         selectedRow = query.row;
         selectedCol = query.col;
      }
      return <Grid alphabet={alphabet} grid={hintsGrid} selectedRow={selectedRow} selectedCol={selectedCol} onClick={clickGridCell} />;
   };

   const renderAlphabet = function () {
      const {alphabet, hintsGrid} = self.props.scope;
      const {hintQuery} = self.state;
      let selectedLetterRank;
      if (hintQuery !== undefined && hintQuery.type === 'alphabet') {
         selectedLetterRank = hintQuery.rank;
      }
      const qualifiers = getLetterQualifiersFromGrid(hintsGrid, alphabet);
      return <Alphabet alphabet={alphabet} qualifiers={qualifiers} onClick={clickGridAlphabet} selectedLetterRank={selectedLetterRank} />;
   }

   const renderHintQuery = function () {
      const {hintState} = self.state;
      if (hintState === "preparing") {
         const {alphabet, score, getQueryCost} = self.props.scope;
         const {hintQuery} = self.state;
         const cost = getQueryCost(hintQuery);
         return (
            <div className='dialog'>
               <div className='dialogLine'>
                  <strong>Indice demandé :</strong>{' '}
                  {hintQuery.type === "grid"
                   ? <span>lettre à la ligne <span className='dialogIndice'>{hintQuery.row + 1}</span>, colonne <span className='dialogIndice'>{hintQuery.col + 1}</span> de la grille.</span>
                   : <span>position de la lettre <span className='dialogIndice'>{alphabet.symbols[hintQuery.rank]}</span> dans la grille</span>}
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
      } else if (hintState === "error") {
         return (
            <div className='dialog'>
               Une erreur s'est produite et l'indice n'a pas été obtenu.
               <button type='button' className='btn-tool' onClick={cancelDialog}>OK</button>
            </div>
         );
      } else if (hintState === "invalid") {
         return <div className='dialog'>Cet indice a déjà été obtenu</div>;
      }
      return "";
   };

   self.render = function() {
      const {score, getQueryCost} = self.props.scope;
      const {outputGridVariable} = self.props.toolState;
      const outputVars = [{label: "Grille enregistrée", name: outputGridVariable}];
      return (
         <div className='panel panel-default hintsPlayFair'>
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
               <div className='playfair-score'>
                  <span><strong>Points disponibles :</strong> {score} points</span>
               </div>
            </div>
         </div>
      );
   };

}, _self => {
   return {
      hintQuery: undefined,
      hintValues: undefined,
      hintState: "idle"
   };
});

export const compute = function (toolState, scope) {
   scope.outputGrid = scope.hintsGrid;
};

export default self => {
   self.state = {
      outputGridVariable: undefined
   };
   self.Component = Component;
   self.compute = compute;
};
