/* OBSOLETE CODE 2016 */

import React from 'react';
import {connect} from 'react-redux';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';

import AuthHeader from '../ui/auth_header';
import Logout from '../ui/logout';

const RoundOverScreen = EpicComponent(self => {

  const onShowMainScreen = function () {
    self.props.dispatch({type: 'SHOW_MAIN_SCREEN'});
  };

  const renderPostRound4 = function () {
    const {team, participations} = self.props;
    let totalScore = 0;
    let participation;
    participations.forEach(function (p) {
      const score = parseInt(p.score);
      if (!isNaN(score))
        totalScore += score;
      if (p.round.id === 4)
        participation = p;
    });
    const {score, score_90min, first_equal_90min} = participation;
    return (
      <div>
        <p>
          {"Votre score pour le tour 4 est de "}
          {participation.score}
          {".  Votre score au bout d'1h30 était de "}
          {participation.score_90min}
          {", et vous avez obtenu ce score en "}
          {participation.first_equal_90min}
          {" minutes."}
        </p>
        <p>
          {"Votre score total pour les tours 2 à 4 est de "}
          {totalScore}{"."}
        </p>
        <p>
          {"Malheureusement ce n'est pas suffisant pour vous qualifier à la finale."}
        </p>
      </div>
    );
  };

  self.render = function () {
    const {alkindi, team, round} = self.props;
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <Logout alkindi={alkindi}/>
        </div>
        <AuthHeader/>
        <p>
          {'Le '}{round.title}{' est maintenant terminé.'}
        </p>
        {round.status === 'over' && <p>
          Les résultats seront bientôt annoncés, vous pourrez bientôt voir sur
          cette page si votre équipe est qualifiée pour le tour suivant.
        </p>}
        {round.status === 'closed' &&
          (round.id !== 4
            ? <div>
                <p>
                  {'Le score de votre équipe pour ce tour est : '}{team.score||0}
                </p>
                <p>Malheureusement, votre équipe n'est pas qualifiée pour le tour suivant.</p>
                <p>Merci pour votre participation.</p>
              </div>
            : renderPostRound4()
          )}
        {team.rank && <p>
          {'Votre rang au niveau national est : '}{team.rank}
          {' sur '}{team.n_teams}{' équipes ayant participé au 2ème tour.'}
        </p>}
        {team.rank_region && <p>
          {'Votre rang au sein de votre académie ('}{team.region.name}
          {') est : '}{team.rank_region}
          {' sur '}{team.n_teams_region}{' équipes ayant participé au 2ème tour'}.
        </p>}
        <p>
          Vous pouvez revoir votre participation en cliquant le bouton ci-dessous.
        </p>
        <p><Button onClick={onShowMainScreen}>revoir ma participation</Button></p>
      </div>
    );
  };
});

export const selector = function (state) {
  const {team, round, participations} = state.response;
  return {team, round, participations};
};

export default connect(selector)(RoundOverScreen);
