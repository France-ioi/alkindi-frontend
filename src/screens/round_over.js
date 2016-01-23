import React from 'react';
import {connect} from 'react-redux';
import EpicComponent from 'epic-component';

import AuthHeader from '../ui/auth_header';
import Logout from '../ui/logout';

const RoundOverScreen = EpicComponent(self => {
  self.render = function () {
    const {team, round} = self.props;
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <Logout/>
        </div>
        <AuthHeader/>
        <p>
          {'Le '}{round.title}{' est maintenant terminé.'}
        </p>
        <p>
          {'Le score de votre équipe pour ce tour est : '}{team.score||0}
        </p>
        <p>
          Les résultats seront bientôt annoncés, vous pourrez bientôt voir sur
          cette page si votre équipe est qualifiée pour le tour suivant.
        </p>
      </div>
    );
  };
});

export const selector = function (state) {
  const {team, round} = state.response;
  return {team, round};
};

export default connect(selector)(RoundOverScreen);
