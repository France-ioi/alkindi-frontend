import React from 'react';
import classnames from 'classnames';

import {PureComponent} from '../misc';

const tabs = [
  {key: 'question', label: "Sujet"},
  {key: 'cryptanalysis', label: "Cryptanalyse"},
  {key: 'history', label: "Historique"},
  {key: 'team', label: "Équipe"}
];

let AlkindiTabs = PureComponent(self => {
  const setActiveTab = function (key) {
    return function () {
      self.props.setActiveTab(key);
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
      const onClick = disabled ? false : setActiveTab(key);
      var classes = classnames({
          actif: activeTabKey === key,
          indisponible: disabled
        });
      return <li key={key} className={classes} onClick={onClick}><a>{label}</a></li>;
    })
    return <ul id="navigation">{items}</ul>;
  };
});

export default AlkindiTabs;
