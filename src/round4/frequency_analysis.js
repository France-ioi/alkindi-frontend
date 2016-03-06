import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {DragSource, DropTarget} from 'react-dnd';
import classnames from 'classnames';

import Variables from '../tool-ui/variables';
import Python from '../tool-ui/python';
import {c, getFrequencies, buildSubstitution} from './common';

const BareSubstTarget = EpicComponent(self => {
   self.render = function () {
      const {bigram, bigramFreq, qualifier, barScale} = self.props;
      const {isDragging, connectDropTarget, connectDragSource} = self.props;
      const isDragTarget = typeof connectDropTarget === 'function';
      const isDragSource = typeof connectDragSource === 'function';
      const classes = [
         c('substSource'), c('draggable'), isDragging && c('dragging'),
         c('substBigram-' + qualifier)]
      let el = (
         <span className={classnames(classes)}>
            {bigramFreq &&
               <span className={c('substHistoUp')} title={(bigramFreq.proba * 100).toFixed(1)+'%'}>
                  <span style={{height: (bigramFreq.proba * barScale).toFixed(1)+'px'}}></span>
               </span>}
            <span className={c('substSourceSymbol')}>
               {bigram}
            </span>
         </span>
      );
      if (isDragTarget)
         el = connectDropTarget(el);
      if (isDragSource)
         el = connectDragSource(el);
      return el;
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
      const {bigram, letter} = props;
      return {bigram, letter};
   }
};
const targetSpec = {
   drop: function (props, monitor, component) {
      const dragSource = monitor.getItem();
      const {bigram, letter} = props;
      const dragTarget = {bigram, letter};
      props.onDrop(dragSource, dragTarget);
   }
};
const SubstSource =
   DragSource(c('substSource'), sourceSpec, sourceCollect)(
   DropTarget(c('substSource'), targetSpec, targetCollect)(
   BareSubstTarget));

export const Component = EpicComponent(self => {

   const onDrop = function (dragSource, dragTarget) {
      const {editedPairs, alwaysSwap} = self.props.toolState;
      const targetBigram = dragTarget.bigram;
      const targetHasEntry = targetBigram in editedPairs;
      if (dragSource.bigram === dragTarget.bigram) {
         // Swapping a bigram with itself does nothing in alwaysSwap mode.
         if (alwaysSwap)
            return;
         // In non-alwaysSwap mode, it toggles the edited flag.
         const targetEdited = targetHasEntry && editedPairs[targetBigram].edited;
         self.props.setToolState({editedPairs: {
            ...editedPairs,
            [targetBigram]: {letter: dragTarget.letter, edited: !targetEdited}
         }});
         return;
      }
      if (alwaysSwap || targetHasEntry) {
         const targetEdited = targetHasEntry && editedPairs[targetBigram].edited;
         self.props.setToolState({editedPairs: {
            ...editedPairs,
            [dragSource.bigram]: {letter: dragTarget.letter, edited: true},
            [dragTarget.bigram]: {letter: dragSource.letter, edited: targetEdited}
         }});
      } else {
         self.props.setToolState({editedPairs: {
            ...editedPairs,
            [dragSource.bigram]: {letter: dragTarget.letter, edited: true}
         }});
      }
   };

   const onReset = function () {
      self.props.setToolState({editedPairs: {}});
   };

   const onClickFreqLeft = function (event) {
      const symbol = event.currentTarget.getAttribute('data-symbol');
      self.setState({freqLeft: symbol});
   };

   const onClickFreqRight = function (event) {
      const symbol = event.currentTarget.getAttribute('data-symbol');
      self.setState({freqRight: symbol});
   };

   const onClickFreqPair = function () {
      const {freqLeft, freqRight} = self.state;
      if (freqLeft !== undefined && freqRight !== undefined) {
         self.setState({freqLeft: undefined, freqRight: undefined});
         const {bigramAlphabet, targetAlphabet, outputSubstitution} = self.props.scope;
         const leftRank = bigramAlphabet.ranks[freqLeft];
         const rightRank = targetAlphabet.ranks[freqRight];
         // outputSubstitution.reverseMapping
         self.props.setToolState({editedPairs});
      }
   };

   self.state = {};

   self.render = function() {
      const {inputTextVariable, outputSubstitutionVariable} = self.props.toolState;
      const {bigramFrequencies, bigramAlphabet, targetAlphabet, outputSubstitution, referenceFrequencies, substRows} = self.props.scope;
      const {freqLeft, freqRight} = self.state;
      const barScale = 42 / referenceFrequencies[0].proba;
      const inputVars = [
         {label: "Texte chiffré", name: inputTextVariable}
      ];
      const outputVars = [
         {label: "Substitution", name: outputSubstitutionVariable}
      ];
      const refFreqMap = {};
      referenceFrequencies.forEach(function (stat) {
         refFreqMap[stat.symbol] = stat;
      });
      const bigramFreqMap = {};
      bigramFrequencies.forEach(function (stat) {
         bigramFreqMap[stat.symbol] = stat;
      });

      const renderFreqBlock = function () {
         return (
            <div className={c('freqBlock')}>
               <div className={c('freqLeft')}>
                  {bigramFrequencies.map(function (item, i) {
                     const classes = [c('freqRow'), freqLeft === item.symbol && c('freqRowSelected')];
                     return (
                        <div key={i} className={classnames(classes)} data-symbol={item.symbol} onClick={onClickFreqLeft}>
                           <span className={classnames[c('freqHisto'), c('freqLeftHisto')]} title={(item.proba * 100).toFixed(1)+'%'}>
                              <span style={{width: (item.proba * barScale).toFixed(1)+'px'}}></span>
                           </span>
                           <span className={c('freqSymbol')}>{item.symbol}</span>
                        </div>
                     );
                  })}
               </div>
               <div className={c('freqRight')}>
                  {referenceFrequencies.map(function (item, i) {
                     const classes = [c('freqRow'), freqRight === item.symbol && c('freqRowSelected')];
                     return (
                        <div key={i} className={classnames(classes)} data-symbol={item.symbol} onClick={onClickFreqRight}>
                           <span className={c('freqSymbol')}>{item.symbol}</span>
                           <span className={classnames[c('freqHisto'), c('freqRightHisto')]} title={(item.proba * 100).toFixed(1)+'%'}>
                              <span style={{width: (item.proba * barScale).toFixed(1)+'px'}}></span>
                           </span>
                        </div>
                     );
                  })}
               </div>
               <Button onClick={onClickFreqPair}>associer</Button>
            </div>
         );
      };

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
               {false && <Variables inputVars={inputVars} outputVars={outputVars} />}
               {false && renderFreqBlock()}
               <Button onClick={onReset}>réinitialiser</Button>
               <div className='clearfix'>
                  <div className={c('subst')}>
                     {substRows.map((row, i) =>
                        <div key={i} className={c('substRow')}>
                           {row.map(function (targetRank, j) {
                              const sourceRank = outputSubstitution.reverseMapping[targetRank];
                              const cell = outputSubstitution.mapping[sourceRank];
                              const qualifier = cell.qualifier;
                              const bigram = bigramAlphabet.symbols[sourceRank];
                              const bigramFreq = bigramFreqMap[bigram];
                              const letter = targetAlphabet.symbols[targetRank];
                              const letterFreq = refFreqMap[letter];
                              return (<span key={j} className={c('substPair')}>
                                 <SubstSource bigram={bigram} qualifier={qualifier} bigramFreq={bigramFreq} barScale={barScale} letter={letter} onDrop={onDrop} />
                                 {false && <span className={c('substMapsTo')}>
                                    <i className='fa fa-long-arrow-down'/>
                                 </span>}
                                 <span className={c('substTarget')}>
                                    <span className={c('substTargetSymbol')}>
                                       {letter}
                                    </span>
                                    {letterFreq && letterFreq.proba > 0 &&
                                       <span className={c('substHistoDown')} title={(letterFreq.proba * 100).toFixed(1)+'%'}>
                                          <span style={{height: (letterFreq.proba * barScale).toFixed(1)+'px'}}></span>
                                       </span>}
                                 </span>
                              </span>);
                           })}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (toolState, scope) {
   const {inputText, targetAlphabet, referenceFrequencies} = scope;
   const {editedPairs} = toolState;
   scope.bigramFrequencies = getFrequencies(inputText);
   scope.outputSubstitution = buildSubstitution(
      editedPairs, inputText, targetAlphabet, scope.bigramFrequencies,
      referenceFrequencies);
};

export default self => {
   self.state = {};
   self.Component = Component;
   self.compute = compute;
};
