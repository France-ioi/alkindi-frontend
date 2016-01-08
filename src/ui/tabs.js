import React from 'react';
import classnames from 'classnames';

import {PureComponent} from '../misc';

const tabs = [
  {key: 'team', label: "Équipe"},
  {key: 'task', label: "Sujet"},
  {key: 'cryptanalysis', label: "Cryptanalyse"},
  {key: 'history', label: "Historique"},
  {key: 'answer', label: "Soumission"}
];

let AlkindiTabs = PureComponent(self => {
  const setActiveTab = function (key) {
    return function () {
      self.props.setActiveTab(key);
    };
  };
  self.render = function () {
    let {activeTabKey, enabledTabs} = self.props;
    const items = tabs.map(function (tab) {
      const {key, label} = tab;
      const enabled = enabledTabs[tab.key];
      const onClick = enabled ? setActiveTab(key) : false;
      var classes = classnames({
          actif: activeTabKey === key,
          indisponible: !enabled
        });
      return <li key={key} className={classes} onClick={onClick}><a>{label}</a></li>;
    })
    return <ul id="navigation">{items}</ul>;
  };
});

export default AlkindiTabs;
