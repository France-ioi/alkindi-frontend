import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {DragSource, DropTarget} from 'react-dnd';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {getQualifierClass, getFrequencies, applySubstitutionToText} from './common';

const BareSubstTarget = EpicComponent(self => {
   self.render = function () {
      const {source, target, targetAlphabet, targetFrequency} = self.props;
      const {isDragging, connectDropTarget, connectDragSource} = self.props;
      const targetSymbol = targetAlphabet.symbols[target.l];
      return connectDropTarget(connectDragSource(
         <div className={classnames(['adfgx-subst-tgt', isDragging && 'dragging'])}>
            <span className='adfgx-subst-char'>{targetSymbol}</span>
            <span className='adfgx-subst-freq' style={{height: (targetFrequency * 300).toFixed(1)+'px'}} title={(targetFrequency * 100).toFixed(1)+'%'}></span>
         </div>
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
      const {source, target} = props;
      return {source, target};
   }
};
const targetSpec = {
   drop: function (props, monitor, component) {
      const dragSource = monitor.getItem();
      const {source, target} = props;
      const dragTarget = {source, target};
      props.onDrop(dragSource, dragTarget);
   }
};
const SubstTarget =
   DragSource('adfgx-subst-target', sourceSpec, sourceCollect)(
   DropTarget('adfgx-subst-target', targetSpec, targetCollect)(
   BareSubstTarget));

export const Component = EpicComponent(self => {

   const onDrop = function (dragSource, dragTarget) {
      const {bigramAlphabet, targetAlphabet} = self.props.scope;
      const {toolState} = self.props;
      const key1 = bigramAlphabet.symbols[dragTarget.source.l];
      const value1 = targetAlphabet.symbols[dragSource.target.l];
      const key2 = bigramAlphabet.symbols[dragSource.source.l];
      const value2 = targetAlphabet.symbols[dragTarget.target.l];
      self.props.setToolState({editedPairs: {
         ...toolState.editedPairs,
         [key1]: value1,
         [key2]: value2
      }});
   };

   self.render = function() {
      const {inputTextVariable, outputSubstitutionVariable} = self.props.toolState;
      const {bigramFreqs, bigramAlphabet, targetAlphabet, outputSubstitution, targetFrequencies} = self.props.scope;
      const substitution = outputSubstitution.mapping;
      const renderBigramHisto = function (bigram) {
         const targetCell = substitution[bigram.l];
         return (
            <div key={bigram.l} className='adfgx-subst-pair'>
               <div className='adfgx-subst-src'>
                  <span className='adfgx-subst-freq' style={{height: (bigram.p * 300).toFixed(1)+'px'}} title={(bigram.p * 100).toFixed(1)+'%'}></span>
                  <span>{bigramAlphabet.symbols[bigram.l]}</span>
               </div>
               <SubstTarget source={bigram} target={targetCell} targetAlphabet={targetAlphabet} targetFrequency={targetFrequencies[targetCell.l]} onDrop={onDrop} />
            </div>
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
               <div className='adfgx-subst'>
                  {bigramFreqs.map(renderBigramHisto)}
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
   scope.bigramFreqs = getFrequencies(cipheredText);
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
   const substitution = Array(bigramAlphabet.size);
   scope.bigramFreqs.forEach(function (bigram) {
      const symbol = bigramAlphabet.symbols[bigram.l];
      let targetRank, qualifier;
      if (symbol in editedPairs) {
         targetRank = targetAlphabet.ranks[editedPairs[symbol]];
         qualifier = 'guess';  // XXX or locked
      } else {
         targetRank = unusedRanks[nextUnusedRankPos];
         nextUnusedRankPos += 1;
         qualifier = 'unknown';
      }
      substitution[bigram.l] = {l: targetRank, q: qualifier};
   });
   scope.outputSubstitution = {
      sourceAlphabet: bigramAlphabet,
      targetAlphabet: targetAlphabet,
      mapping: substitution
   };
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
