import React from 'react';
import EpicComponent from 'epic-component';
import range from 'node-range';
import classnames from 'classnames';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import OkCancel from '../tool-ui/ok_cancel';
import Tooltip from '../ui/tooltip';

const Grid = EpicComponent(self => {

   const onClick = function (event) {
      const element = event.currentTarget;
      const row = parseInt(element.getAttribute('data-row'));
      const col = parseInt(element.getAttribute('data-col'));
      const {grid, sourceAlphabet} = self.props;
      const nbCols = grid[0].length;
      const cell = grid[row][col];
      const bigram = sourceAlphabet.symbols[row * nbCols + col];
      self.props.onClick(row, col, cell, bigram);
   };

   self.render = function () {
      const {grid, sourceAlphabet, targetAlphabet} = self.props;
      const {selectedRow, selectedCol} = self.props;
      const nbRows = grid.length;
      const nbCols = grid[0].length;
      const renderCell = function (row, col) {
         const rank = grid[row][col];
         const classes = ['adfgx-cell'];
         if (selectedRow === row && selectedCol === col) {
            classes.push("adfgx-cell-selected");
         }
         const symbol = rank === null ? ' ' : targetAlphabet.symbols[rank];
         return <td key={col} className={classnames(classes)} onClick={onClick} data-row={row} data-col={col}>{symbol}</td>;
      };
      const renderRow = function (row) {
         return (
            <tr key={row}>
               <th>{sourceAlphabet.symbols[row * nbCols].charAt(0)}</th>
               {range(0, nbCols).map(col => renderCell(row, col))}
            </tr>
         );
      };
      return (
         <table className='adfgx-grid'>
            <thead>
               <tr><th/>{range(0, nbRows).map(i => <th key={i}>{sourceAlphabet.symbols[i].charAt(1)}</th>)}</tr>
            </thead>
            <tbody>
               {range(0, nbRows).map(renderRow)}
            </tbody>
         </table>
      );
   };

});

const HintQuery = EpicComponent(self => {

   self.render = function () {
      const {step, query, cost, score, obtained, onOk, onCancel} = self.props;
      if (step === "preparing") {
         return (
            <div className='dialog'>
               <p>
                  <strong>Indice demandé :</strong>{' '}
                  {query.type === "subst-cipher" &&
                     <span>bigramme chiffrant la lettre <strong>{query.letter}</strong></span>}
                  {query.type === "subst-decipher" &&
                     <span>lettre déchiffrant le bigramme <strong>{query.bigram}</strong></span>}
                  {query.type === "perm-decipher" &&
                     <span>ligne où est envoyée la ligne <strong>{query.line}</strong> au déchiffrage</span>}
                  {query.type === "perm-cipher" &&
                     <span>ligne où est envoyée la ligne <strong>{query.line}</strong> au chiffrage</span>}
               </p>
               {!obtained && <p><strong>Coût :</strong> {cost} points</p>}
               {!obtained && <p><strong>Score disponible :</strong> {score} points</p>}
               {!obtained && <p>L’indice obtenu sera visible par toute l’équipe.</p>}
               {obtained && <p>L’indice a déjà été obtenu.</p>}
               {obtained
                  ? <OkCancel onOk={onCancel}/>
                  : <OkCancel onOk={onOk} onCancel={onCancel}/>
               }
            </div>
         );
      } else if (step === "waiting") {
         return <div className='dialog'>En attente de réponse du serveur</div>;
      } else if (step === "received") {
         return (
            <div className='dialog'>
               <p>Indice obtenu.</p>
               <OkCancel onOk={onCancel}/>
            </div>
         );
      } else if (step === "error") {
         return (
            <div className='dialog'>
               <p>Une erreur s'est produite et l'indice n'a pas été obtenu.</p>
               <OkCancel onOk={onCancel}/>
            </div>
         );
      } else if (step === "invalid") {
         return (
            <div className='dialog'>
               <p>Cet indice a déjà été obtenu.</p>
               <OkCancel onOk={onCancel}/>
            </div>
         );
      }
      return false;
   };

});

export const Component = EpicComponent(self => {

   /*
      props:
         scope:
            hintsGrid
            getHint
            getQueryCost
            outputSubstitution
            outputPermutation
         toolState:
            outputSubstitutionVariable
            outputPermutationVariable
   */

   const renderAlphabet = function () {
      return false;
   };
   const renderPermForward = function () {
      return false;
   };
   const renderPermBackward = function () {
      return false;
   };

   const onSelectCell = function (row, col, cell, bigram) {
      self.setState({
         selectedRow: row,
         selectedCol: col,
         hintQuery: {
            type: 'subst-decipher',
            bigram: bigram
         },
         hintStep: 'preparing',
         hintObtained: cell !== null
      });
   };

   const onQueryHint = function () {
      console.log(self.state.hintQuery);
   };

   const onCancelHintQuery = function () {
      self.setState({
         selectedRow: undefined,
         selectedCol: undefined,
         hintQuery: undefined,
         hintStep: undefined
      });
   };

   self.state = {};

   self.render = function() {
      const {outputSubstitutionVariable, outputPermutationVariable} = self.props.toolState;
      const {outputSubstitution, outputPermutation, getQueryCost, score} = self.props.scope;
      const {substitutionGridHints, bigramAlphabet, clearAlphabet} = self.props.scope;
      const {selectedRow, selectedCol, hintQuery, hintObtained, hintStep} = self.state;
      const inputVars = [];
      const outputVars = [
         {label: "Substitution", name: outputSubstitutionVariable},
         {label: "Permutation", name: outputPermutationVariable}
      ];
      const areHintsEnabled = true;
      const renderCell = function (c) {
         return 'l' in c ? c.l : 'None';
      };
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputSubstitutionVariable}/>
                     <Python.Grid grid={outputSubstitution} renderCell={renderCell}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               {hintStep && <HintQuery step={hintStep} query={hintQuery} cost={getQueryCost(hintQuery)} obtained={hintObtained} score={score} onOk={onQueryHint} onCancel={onCancelHintQuery}/>}
               {false && <Variables inputVars={inputVars} outputVars={outputVars}/>}
               {areHintsEnabled && <div className='grillesSection'>
                  <p className='hints-title'>Plusieurs types d'indices sont disponibles :</p>
                  <p className='hints-section-title'>Des indices sur le contenu de la grille :</p>
                  <div className='adfgx-hints-grid'>
                     <p>
                        {'Révéler une case : '}
                        {getQueryCost({type: "grid"})}
                        {' points '}
                        <Tooltip content={<p>Cliquez sur une case de la grille pour demander quelle lettre elle contient.</p>}/>
                     </p>
                     <Grid grid={substitutionGridHints} sourceAlphabet={bigramAlphabet} targetAlphabet={clearAlphabet} onClick={onSelectCell} selectedRow={selectedRow} selectedCol={selectedCol}/>
                  </div>
                  <div className='adfgx-hints-alphabet'>
                     <p>
                        {'Révéler la position d\'une lettre : '}
                        {getQueryCost({type: "alphabet"})}
                        {' points '}
                        <Tooltip content={<p>Cliquer sur une lettre non grisée ci-dessous pour demander sa position au sein de la grille.</p>}/>
                     </p>
                     {renderAlphabet(outputSubstitution)}
                  </div>
                  <p className='hints-section-title'>Des indices sur la permutation :</p>
                  <div className='adfgx-hints-perm-decipher'>
                     <p>
                        {'Révéler la ligne où sera envoyée chacune des 6 lignes pour obtenir le message intermédiaire : '}
                        {getQueryCost({type: "perm-decipher"})}
                        {' points '}
                        <Tooltip content={<p>TODO</p>}/>
                     </p>
                     {renderPermForward(outputPermutation)}
                  </div>
                  <div className='adfgx-hints-perm-cipher'>
                     <p>
                        {'Révéler la ligne d\'origine d\'une des 6 lignes du message intermédiaire : '}
                        {getQueryCost({type: "perm-cipher"})}
                        {' points '}
                        <Tooltip content={<p>TODO</p>}/>
                     </p>
                     {renderPermBackward(outputPermutation)}
                  </div>
               </div>}
               {!areHintsEnabled && <div>
                  <p>Pour la première journée du 3ème tour, les indices sont désactivés.</p>
                  <p>
                     Nous vous invitons à essayer de déchiffrer le message sans aucun
                     indice.
                     C'est possible avec un peu de persévérance et une bonne stratégie.
                  </p>
                  <p>À partir de demain, vous pourrez demander des indices.</p>
               </div>}
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   // Substitution
   const {substitutionGridHints, bigramAlphabet, clearAlphabet} = scope;
   const mapping = [];
   substitutionGridHints.forEach(function (row, i) {
      row.forEach(function (l, j) {
         mapping.push(l === null ? {q:'unknown'} : {q:'hint',l});
      })
   });
   scope.outputSubstitution = {
      mapping,
      sourceAlphabet: bigramAlphabet,
      targetAlphabet: clearAlphabet
   };
   // Permutation
   const {permutationHints} = scope;
   scope.outputPermutation = permutationHints.map(
      l => l === null ? {q:'unknown'} : {q:'hint',l});
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
