
import React from 'react';
import EpicComponent from 'epic-component';

const FinalScreen = EpicComponent(self => {

  const onShowMainScreen = function () {
    self.props.dispatch({type: 'SHOW_MAIN_SCREEN'});
  };

  function renderOver () {
    return (
      <div>
        <p style={{fontSize: '200%'}}>
          Le deuxième tour est terminé, les résultats sont en cours de préparation.
        </p>
      </div>
    );
  }

  function renderFinal () {
    return (
      <div>
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
  }

  self.render = function () {
    const {alkindi, round, LogoutButton, AuthHeader} = self.props;
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <LogoutButton/>
        </div>
        <AuthHeader/>
        {renderOver()}
      </div>
    );
  };

});

export default function (bundle, deps) {

  bundle.use('refresh', 'LogoutButton', 'AuthHeader');

  bundle.defineView('FinalScreen', FinalScreenSelector, FinalScreen);

  function FinalScreenSelector (state) {
    const {team, round} = state.response;
    const {LogoutButton, AuthHeader} = deps;
    return {team, round, LogoutButton, AuthHeader};
  }

};
