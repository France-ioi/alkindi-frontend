import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {DragSource, DropTarget} from 'react-dnd';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {getFrequencies, applySubstitutionToText, getQualifierClass} from '../utils/cell';

const qualifierClasses = {
   'hint': 'qualifier-hint',
   'confirmed': 'qualifier-confirmed',
   'locked': 'qualifier-confirmed',
   'guess': 'qualifier-confirmed',
   'unknown': 'qualifier-unconfirmed'
};

const BareSubstTarget = EpicComponent(self => {
   self.render = function () {
      const {source, target, targetAlphabet, targetFrequency} = self.props;
      const {isDragging, connectDropTarget, connectDragSource} = self.props;
      const targetSymbol = targetAlphabet.symbols[target.l];
      const classes = ['adfgx-subst-target', isDragging && 'dragging', qualifierClasses[target.q]];
      return connectDropTarget(connectDragSource(
         <span className={classnames(classes)}>
            <span>{targetSymbol}</span>
            {' '}
            <span>{(targetFrequency * 100).toFixed(1)}{'%'}</span>
         </span>
      ));
   };
});

function sourceCollect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
};
const targetCollect = function (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
};
const sourceSpec = {
  beginDrag: function (props) {
    return {source: props.source};
  }
};
const targetSpec = {
  drop: function (props, monitor, component) {
    const item = monitor.getItem();
    props.onDrop(item.source, props.target);
  }
};
const SubstTarget =
   DragSource('adfgx-subst-target', sourceSpec, sourceCollect)(
   DropTarget('adfgx-subst-target', targetSpec, targetCollect)(
   BareSubstTarget));

export const Component = EpicComponent(self => {

   const onDrop = function (source, target) {
      console.log('drog', source, target);
   };

   self.render = function() {
      const {inputTextVariable, outputSubstitutionVariable} = self.props.toolState;
      const {bigramFreqs, bigramAlphabet, targetAlphabet, substitution, targetFrequencies} = self.props.scope;
      const renderBigramHisto = function (bigram, iBigram) {
         const targetCell = substitution[iBigram];
         return (
            <li key={bigram.l}>
               <div>
                  {bigramAlphabet.symbols[bigram.l]}
                  {' '}
                  <span>{(bigram.p * 100).toFixed(1)}{'%'}</span>
               </div>
               <SubstTarget source={bigram} target={targetCell} targetAlphabet={targetAlphabet} targetFrequency={targetFrequencies[targetCell.l]} onDrop={onDrop} />
            </li>
         );
      };
      // Button to reset substitution to match order of bigrams frequencies
      // with order of letter frequencies in french.
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputSubstitutionVariable}/>
                     <Python.Call name="analyseFréquence">
                        <Python.Var name={inputTextVariable}/>
                        <span>…</span>
                     </Python.Call>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <div>
                  <ul>{bigramFreqs.map(renderBigramHisto)}</ul>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {targetAlphabet, bigramAlphabet, cipheredText, targetFrequencies} = scope;
   const {editedPairs} = toolState;
   // Compute bigram frequencies.
   const text = {cells: cipheredText, alphabet: bigramAlphabet};
   scope.bigramFreqs = getFrequencies(text);
   // Mark symbols in editedPairs as used, other target symbols as unused.
   const symbolUsed = Array(bigramAlphabet.size).fill(false);
   Object.keys(editedPairs).forEach(function (bigram) {
      const rank = targetAlphabet.ranks[editedPairs[bigram]];
      symbolUsed[rank] = true;
   });
   // Build a list of unused ranks in target alphabet sorted by decreasing target frequency.
   const sortedFrequencies = Array(targetFrequencies.size);
   targetFrequencies.forEach(function (p, i) {
      sortedFrequencies[i] = {p, i};
   });
   sortedFrequencies.sort(function byProbability (a, b) {
      return a.p > b.p ? -1 : (a.p < b.p ? 1 : 0);
   });
   const unusedRanks = [];
   sortedFrequencies.forEach(function (a) {
      const rank = a.i;
      if (!symbolUsed[rank])
         unusedRanks.push(rank)
   });
   // Generate a substitution using editedPairs and filling with the stats.
   let nextUnusedRankPos = 0;
   const substitution = [];
   bigramAlphabet.symbols.forEach(function (symbol) {
      let targetRank, qualifier;
      if (symbol in editedPairs) {
         targetRank = targetAlphabet.ranks[editedPairs[symbol]];
         qualifier = 'guess';  // XXX or locked
      } else {
         targetRank = unusedRanks[nextUnusedRankPos];
         nextUnusedRankPos += 1;
         qualifier = 'unknown';
      }
      substitution.push({l: targetRank, q: qualifier});
   });
   scope.substitution = substitution;
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
