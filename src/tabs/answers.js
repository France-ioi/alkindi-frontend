import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {PureComponent} from '../misc';

const AnswersTab = PureComponent(self => {

  self.render = function () {
    return (
      <div className="wrapper">
        <p>
          Ici vous pourrez très bientôt (dans le courrant du week-end) valider
          votre réponse au sujet d'entrainement, puis aux sujets en temps limité.
        </p>
        <p>
          La réponse au sujet comportera trois parties : une adresse et deux
          nombres.
        </p>
      </div>
    );
  };
});

export default AnswersTab;
