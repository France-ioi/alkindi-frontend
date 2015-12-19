import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import {PureComponent} from '../misc';
import {setActiveTab} from '../actions';

const tabsSelector = function (state) {
  const {activeTabKey, team, question} = state;
  return {activeTabKey, haveTeam: !!team, haveQuestion: !!question};
};

const tabs = [
  {key: 'question', label: "Sujet"},
  {key: 'cryptanalysis', label: "Cryptanalyse"},
  {key: 'history', label: "Historique"},
  {key: 'team', label: "Équipe"}
];

let AlkindiTabs = connect(tabsSelector)(PureComponent(self => {
  const setActive = function (key) {
    return function () {
      self.props.dispatch(setActiveTab(key));
    };
  };
  self.render = function () {
    let {activeTabKey, haveTeam, haveQuestion} = self.props;
    // TODO: compute disabled status of tabs.
    const tabDisabled = {
      question: !haveTeam,
      cryptanalysis: !haveQuestion,
      history: !haveQuestion,
      team: false
    };
    const items = tabs.map(function (tab) {
      const {key, label} = tab;
      const disabled = tabDisabled[key];
      const onClick = disabled ? false : setActive(key);
      var classes = classnames({
          actif: activeTabKey === key,
          indisponible: disabled
        });
      return <li key={key} className={classes} onClick={onClick}><a>{label}</a></li>;
    })
    return <ul id="navigation">{items}</ul>;
  };
}));

export default AlkindiTabs;
