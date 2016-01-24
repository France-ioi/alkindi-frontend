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
        {round.status === 'over' && <p>
          Les résultats seront bientôt annoncés, vous pourrez bientôt voir sur
          cette page si votre équipe est qualifiée pour le tour suivant.
        </p>}
        {round.status === 'closed' && <div>
          <p>Malheureusement, votre équipe n'est pas qualifiée pour le tour suivant.</p>
          <p>Merci pour votre participation.</p>
        </div>}
      </div>
    );
  };
});

export const selector = function (state) {
  const {team, round} = state.response;
  return {team, round};
};

export default connect(selector)(RoundOverScreen);
