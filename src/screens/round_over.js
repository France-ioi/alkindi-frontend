
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';

const RoundOverScreen = EpicComponent(self => {

  const onShowMainScreen = function () {
    self.props.dispatch({type: self.props.BypassRoundOverScreen});
  };

/*
  const render2016R4 = function () {
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

  const render2016Closed = function () {
    const {team, round, participation} = self.props;
    return (
      <div>
        <p>
          {'Le '}{round.title}{' est maintenant terminé.'}
        </p>
        {round.status === 'over' && <p>
          Les résultats seront bientôt annoncés, vous pourrez bientôt voir sur
          cette page si votre équipe est qualifiée pour le tour suivant.
        </p>}
        {round.status === 'closed' &&
          <div>
            <p>
              {'Le score de votre équipe pour ce tour est : '}{participation.score||0}
            </p>
            {participation.is_qualified &&
              <p>Félicitations, votre équipe est qualifiée pour le tour suivant, qui est en cours de préparation.</p>}
            {participation.is_qualified ||
              <p>Malheureusement, votre équipe n'est pas qualifiée pour le tour suivant.</p>}
            {participation.is_qualified ||
              <p>Merci pour votre participation.</p>}
          </div>}
        {false && renderPostRound4()}
        {team.rank && <p>
          {'Votre rang au niveau national est : '}{team.rank}
          {' sur '}{team.n_teams}{' équipes ayant participé au 2ème tour.'}
        </p>}
        {team.rank_region && <p>
          {'Votre rang au sein de votre académie ('}{team.region.name}
          {') est : '}{team.rank_region}
          {' sur '}{team.n_teams_region}{' équipes ayant participé au 2ème tour'}.
        </p>}
      </div>
    );
  };

*/

  const render2017R3 = function () {
    const {team, ranking, round, participation} = self.props;
    const {score} = participation;
    if (!ranking) {
      return <p>{"Votre équipe n'est pas classée."}</p>;
    }
    const {national, big_region, region} = ranking;
    return (
      <div>
        <p>
          {"Votre score au 3ème tour est : "}{score}
        </p>
        <p>
          {"Classement national de votre équipe : "}{national.rank}{" sur "}{national.count}
        </p>
        <p>
          {"Classement de votre équipe au sein de votre grande région ("}{big_region.name}{") : "}
          {big_region.rank}{" sur "}{big_region.count}
        </p>
        <p>
          {"Classement de votre équipe au sein de votre académie ("}{region.name}{") : "}
          {region.rank}{" sur "}{region.count}
        </p>
      </div>
    );
  };

  self.render = function () {
    const {LogoutButton, AuthHeader} = self.props;
    /*



      - Users that did not qualify for the next round remain associated with
        the 'closed'-status round
      - Users that did qualify have a new participation associated with the
        next round.

    */
    return (
      <div className="wrapper" style={{position: 'relative'}}>
        <div className="pull-right" style={{position: 'absolute', right: '0', top: '0'}}>
          <LogoutButton/>
        </div>
        <AuthHeader/>
        {render2017R3()}
        <p>
          Vous pouvez revoir votre participation passée en cliquant le bouton ci-dessous.
        </p>
        <p><Button onClick={onShowMainScreen}>revoir ma participation</Button></p>
      </div>
    );
  };
});


export default function (bundle, deps) {

  bundle.use('LogoutButton', 'AuthHeader');

  bundle.defineView('RoundOverScreen', RoundOverScreenSelector, RoundOverScreen);

  bundle.defineAction('BypassRoundOverScreen', 'Screens.RoundOver.Bypass');
  bundle.addReducer('BypassRoundOverScreen', function (state, action) {
    return {...state, bypassRoundOverScreen: true};
  });

  function RoundOverScreenSelector (state) {
    const {team, round, participation, participations, ranking} = state.response;
    const {LogoutButton, AuthHeader, BypassRoundOverScreen} = deps;
    /* Find the current participation, if any. */
    const currentParticipation = participations && participations.find(p => p.is_current);
    return {
      team, round, participation: currentParticipation, ranking,
      LogoutButton, AuthHeader, BypassRoundOverScreen};
  }

};
