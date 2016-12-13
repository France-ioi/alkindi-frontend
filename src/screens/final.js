import React from 'react';
import {connect} from 'react-redux';
import EpicComponent from 'epic-component';

import AuthHeader from '../ui/auth_header';
import Logout from '../ui/logout';

const FinalScreen = EpicComponent(self => {

  const onShowMainScreen = function () {
    self.props.dispatch({type: 'SHOW_MAIN_SCREEN'});
  };

  self.render = function () {
    const {alkindi, round} = self.props;
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <Logout alkindi={alkindi}/>
        </div>
        <AuthHeader/>
        <p>
          Félicitations, votre équipe est qualifiée pour la finale du concours
          Alkindi 2015-2016 !
        </p>
        <p>
          La finale se déroulera à Paris le 18 mai.  Nous allons prendre contact
          avec votre coordinateur pour les détails d'organisation.
        </p>
        <p>
          Vous pouvez revoir votre participation en cliquant le bouton ci-dessous.
        </p>
        <p><Button onClick={onShowMainScreen}>revoir ma participation</Button></p>
      </div>
    );
  };

});

export const selector = function (state) {
  const {team, round} = state.response;
  return {team, round};
};

export default connect(selector)(FinalScreen);
