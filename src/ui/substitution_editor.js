import React from 'react';
import classnames from 'classnames';

import {PureComponent} from '../misc';

export const SubstitutionEditor = PureComponent(self => {
  const getPair = function (sourceIndex) {
    const {indexMap, sourceAlphabet, targetAlphabet} = self.props.substitution;
    const source = sourceAlphabet.symbols[sourceIndex];
    const pair = indexMap[sourceIndex];
    const target = pair && {c: targetAlphabet.symbols[pair.i], l: pair.l};
    return {source, target};
  };
  const toggleLock = function (event) {
    const sourceIndex = parseInt(event.currentTarget.getAttribute('data-key'));
    const pair = getPair(sourceIndex);
    self.props.updatePairs({
      [pair.source]: {...pair.target, l: !pair.target.l}
    });
  };
  const selectOrSwap = function (event) {
    const clickedIndex = parseInt(event.currentTarget.getAttribute('data-key'));
    const target = self.props.substitution.indexMap[clickedIndex];
    // Ignore clicks on locked symbols.
    if (target && target.l)
      return;
    // If there is no selected symbol, select the clicked symbol.
    const {selectedIndex} = self.state;
    if (selectedIndex === undefined) {
      self.setState({selectedIndex: clickedIndex});
      return;
    }
    // Otherwise, exchange the targets for the selected and clicked symbols.
    const clickedPair = getPair(clickedIndex);
    const selectedPair = getPair(selectedIndex);
    self.props.updatePairs({
      [clickedPair.source]: selectedPair.target,
      [selectedPair.source]: clickedPair.target
    });
    self.setState({selectedIndex: undefined});
  };
  self.render = function () {
    const {substitution} = this.props;
    const {selectedIndex} = this.state;
    if (substitution === undefined)
      return (<p>undefined substitution</p>);
    const {sourceAlphabet, targetAlphabet, indexMap} = substitution;
    const charPairs = indexMap.map((p, i) => {
      const sourceSymbol = sourceAlphabet.symbols[i];
      const targetSymbol = targetAlphabet.symbols[p.i];
      const targetClasses = ['char-subs'];
      const lockClasses = ['char-lock'];
      if (i === selectedIndex)
        targetClasses.push('char-selected');
      if (p.l) {
        targetClasses.push('char-locked');
        lockClasses.push('char-locked');
      } else {
        lockClasses.push('char-unlocked');
      }
      return (
        <div key={i} className="char-pairs">
          <span className="char-base">{sourceSymbol}</span>
          <span className={classnames(targetClasses)} onClick={selectOrSwap} data-key={i} >{targetSymbol}</span>
          <span className={classnames(lockClasses)} onClick={toggleLock} data-key={i}><i className='fa fa-lock'/></span>
        </div>);
    });
    const style = {
      width: indexMap.length * 28 + 'px'
    };
    return (<div className='substitution-editor' style={style}>{charPairs}</div>);
  }
}, self => {
  return {
    selectedIndex: undefined
  };
});

SubstitutionEditor.propTypes = {
  substitution: React.PropTypes.object.isRequired,
  updatePairs: React.PropTypes.func
};

SubstitutionEditor.defaultProps = {
  updatePairs: function (pairs) {}
};

export default SubstitutionEditor;
