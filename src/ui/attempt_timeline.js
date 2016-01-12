import React from 'react';

import {PureComponent} from '../misc';
import classnames from 'classnames';
import {Alert, Button} from 'react-bootstrap';

export default PureComponent(self => {
  /* Props:
           attempt
  */

  /*{
      id: 1422,
      round_id: 2,
      team_id: 1114,
      ordinal: 0,
      created_at: "2016-01-10T07:06:36Z",
      started_at: "2016-01-10T07:10:11Z",
      closes_at: null,
      is_current: true,
      is_training: true,
      is_unsolved: false,
      is_fully_solved: false,
      max_score: "490"
  }*/
  const renderTimeline = function (step) {
    const isStart = step === 'start';
    const isConfirm = step === 'confirm';
    const isTask = step === 'unlock';
    const isSolve = step === 'solve';
    const isDone = step === 'done';
    return (
      <div className="timelineSteps">
        <div className={isStart?'active':''}><span>début</span></div>
        <div className={isConfirm?'active':''}><span>confirmation</span></div>
        <div className={isTask?'active':''}><span>accès au sujet</span></div>
        <div className={isSolve?'active':''}><span>résolution</span></div>
        <div className={isDone?'active':''}><span>fin</span></div>
      </div>
    );
  }

  const onStartAttempt = function () {
    const user_id = self.props.user.id;
    Alkindi.api.startAttempt(user_id);
  };
  const onCancelAttempt = function () {
    const user_id = self.props.user.id;
    Alkindi.api.cancelAttempt(user_id);
  };
  const onRevealAccessCode = function () {
    const {attempt} = self.props;
    const user_id = self.props.user.id;
    Alkindi.refresh({access_code: attempt.id});
  };
  const onAccessTask = function () {
    const {user, team, attempt} = self.props;
    // If the team is already locked, no confirmation is asked.
    if (!team.is_locked && !window.confirm("Confirmez-vous définitivement la composition de votre équipe ?"))
      return;
    if (!attempt.is_training && !confirm("Voulez vous vraiment démarrer le sujet en temps limité ?  Vous aurez 60 minutes pour le resoudre."))
      return;
    Alkindi.api.assignAttemptTask(user.id);
  };
  const onResetHints = function () {
    const user_id = self.props.user.id;
    if (window.confirm("Voulez vous vraiment effacer tous les indices ?  Assurez-vous de prévenir vos coéquipiers.")) {
      Alkindi.api.resetHints(user_id);
    }
  };
  const onResetToTraining = function () {
    const team_id = self.props.team.id;
    Alkindi.api.resetTeamToTraining(team_id);
  };
  const onGoToTask = function () {
    self.props.onSwitchTab('task');
  };
  const onGoToAnswers = function () {
    self.props.onSwitchTab('answers');
  };

  const renderCancelAttempt = function (attempt) {
    return (attempt.is_training ?
      <div>
        {attempt.is_training && <p>
          Si vous avez besoin de changer la composition de votre équipe,
          c'est votre dernière opportunité !
        </p>}
        {attempt.is_training && <p>
          Annuler l'accès au sujet d'entrainement ne vous pénalisera pas,
          vous pourrez le commencer une fois votre équipe finalisée.
        </p>}
        <p className="text-center">
          <Button onClick={onCancelAttempt}>
            <i className="fa fa-arrow-left"/> je veux modifier mon équipe
          </Button>
        </p>
      </div>
    :
      <div>
        <p>
          Si vous n'êtes pas prêt à commencer l'épreuve en temps limité,
          vous avez la possibilité de revenir au sujet d'entrainement.
        </p>
        <p>
          Vous pourrez toujours redémarrer l'épreuve en temps limité plus
          tard.
        </p>
        <p className="text-center">
          <Button onClick={onCancelAttempt}>
            <i className="fa fa-arrow-left"/> je ne suis pas prêt pour l'épreuve
          </Button>
        </p>
      </div>
    );
  };

  const renderFutureAttempt = function (attempt) {
    return (
      <div className="timeline-unavailable">
        {renderTimeline()}
      </div>
    );
  };

  const renderAttemptNotCreated = function (attempt) {
    return (
      <div>
        {renderTimeline('start')}
        <div className="timelineInfo">
          <p className="timelineInfoContent">
            {attempt.is_training
              ? "Commencez l'entrainement en cliquant : "
              : "Commencez l'épreuve en temps limité en cliquant : "}
            <Button bsStyle="primary" bsSize="large" onClick={onStartAttempt}>
              {'démarrer '}<i className="fa fa-arrow-right"/>
            </Button>
          </p>
        </div>
      </div>
    );
  };

  const renderAttemptNotConfirmed = function (attempt) {
    return (
      <div>
        {renderTimeline('confirm')}
        <div className="timelineInfo">
          <div className="timelineInfoContent">
            <p>
              Votre code de lancement personnel pour ce sujet est :
            </p>
            <p className="access-code-block">
              <span className="access-code">
                {attempt.access_code === undefined
                 ? <Button bsSize="large" onClick={onRevealAccessCode}>
                     <i className="fa fa-unlock-alt"/> révéler
                   </Button>
                 : <span className="code">{attempt.access_code}</span>}
              </span>
            </p>
            {attempt.is_training
            ? <div className="section">
                <p>Lorsque vous aurez saisi au moins 1 code d'accès vous pourrez
                   accéder au sujet d'entrainement.</p>
                <p><strong>
                   Notez que pour accéder au sujet en temps limité, il faudra saisir
                   plus de 50% des codes.</strong></p>
              </div>
            : <div className="section">
                <p>Lorsque vous aurez saisi plus de 50% des codes vous pourrez
                   accéder au sujet, vous aurez alors {'60'} minutes
                   pour le résoudre.
                </p>
              </div>}
            {renderCancelAttempt(attempt)}
          </div>
        </div>
      </div>
    );
  };

  const renderAttemptNotStarted = function (attempt) {
    const {round, team} = self.props;
    const isOpen = !attempt.is_training || round.is_training_open;
    return (
      <div>
        {renderTimeline('unlock')}
        <div className="timelineInfo">
          <div className="timelineInfoContent">
            {isOpen
              ? <p>
                  Les membres de votre équipe ont donné leur accord pour accéder au sujet,
                  vous pouvez maintenant le déverouiller en cliquant.
                </p>
              : <p>
                  Les membres de votre équipe ont donné leur accord pour accéder au sujet,
                  vous êtes prêts à commencer dès l'ouverture de l'épreuve.
                </p>}
            {!team.is_locked &&
              <p>
                <strong>Attention</strong>, après avoir accédé au sujet vous ne pourrez
                plus changer la composition de votre équipe pendant le reste du concours.
              </p>}
            {isOpen
              ? <p className="text-center">
                  <Button bsStyle="primary" bsSize="large" onClick={onAccessTask}>
                    accéder au sujet <i className="fa fa-arrow-right"/>
                  </Button>
                </p>
              : <Alert bsStyle='success'>
                  L'accès au sujet sera ouvert le {new Date(round.training_opens_at).toLocaleString()}.
                </Alert>}
            {renderCancelAttempt(attempt)}
          </div>
        </div>
      </div>
    );
  };

  const renderAttemptInProgress = function (attempt) {
    return (
      <div>
        {renderTimeline('solve')}
        <div className="timelineInfo">
          <div className="timelineInfoContent">
            {attempt.is_training
              ? <p>
                  Le sujet d'entrainement est visible dans l'onglet Sujet.
                  Lisez le attentivement, il contient des informations
                  importantes !
                </p>
              : <Alert bsStyle='success'>
                  Votre tentative en temps limité se termine le {new Date(attempt.closes_at).toLocaleString()}.
                </Alert>}
            <p className="text-center">
              <Button bsStyle="primary" bsSize="large" onClick={onGoToTask}>
                lire le sujet <i className="fa fa-arrow-right"/>
              </Button>
            </p>
            <p>
              Lorsque vous aurez résolu l'enigme, vous pourrez entrer vos
              réponse dans l'onglet Réponses.
            </p>
            <p className="text-center">
              <Button bsStyle="default" bsSize="large" onClick={onGoToAnswers}>
                j'ai résolu l'énigme <i className="fa fa-arrow-right"/>
              </Button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAttemptFinished = function (attempt) {
    const {round} = self.props;
    return (
      <div>
        {renderTimeline('done')}
        <div className="timelineInfo">
          <div className="timelineInfoContent">
            {attempt.is_training
            ? <div>
                <p>
                  Vous avez résolu le sujet d'entrainement, bravo !
                </p>
                <p>
                  Vous pouvez maintenant démarrer une épreuve en temps limité
                  dès que vous êtes prêts.
                </p>
                <p>
                  Pour approfondir l'entrainement, vous pouvez effacer tous les
                  indices que vous avez demandés en cliquant le bouton ci-dessous.
                  Attention, cela affectera tous vos coéquipiers.
                </p>
                <p className="text-center">
                  <Button onClick={onResetHints}>
                    réinitialiser les indices <i className="fa fa-history"/>
                  </Button>
                </p>
              </div>
            : <div>
                <p>
                  Votre tentative en temps limité s'est terminée le {new Date(attempt.closes_at).toLocaleString()}.
                </p>
                <p>{round.max_attempts} / {attempt.ordinal}</p>
                <p>
                  {'Vous pouvez revenir au sujet d\'entrainement ou démarrer une nouvelle '}
                  {'tentative en temps limité.'}
                </p>
                <p className="text-center">
                  <Button onClick={onResetToTraining}>
                     <i className="fa fa-arrow-left"/> retour à l'entrainement
                  </Button>
                </p>
              </div>}
          </div>
        </div>
      </div>
    );
  };

  const renderPastAttempt = function (attempt) {
    return (
      <div className="timelinePast">
        {renderTimeline('past')}
        <div className="timelineInfo">
          <div className="timelineInfoContent">
            {attempt.is_training
             ? <p>Vous pourrez revenir à l'entrainement après être
                  sorti de l'épreuve en temps limité.</p>
             : <p>Cette tentative est terminée.</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentAttempt = function (attempt) {
    if (!attempt.created_at)
      return renderAttemptNotCreated(attempt);
    if (!attempt.started_at && attempt.needs_codes)
      return renderAttemptNotConfirmed(attempt);
    if (!attempt.has_task)
      return renderAttemptNotStarted(attempt);
    if (!attempt.is_closed && !attempt.is_completed)
      return renderAttemptInProgress(attempt);
    return renderAttemptFinished(attempt);
  };

  const renderBody = function (attempt) {
    if (attempt.is_current)
      return renderCurrentAttempt(attempt);
    if (attempt.created_at)
      return renderPastAttempt(attempt);
    return renderFutureAttempt(attempt);
  };

  self.render = function () {
    const {attempt} = self.props;
    const classes = ["timeline", attempt.is_current && 'timelineCurrent'];
    return (
      <div className={classnames(classes)}>
        <div className="timelineHeader">
          {attempt.max_score &&
            <div className="playfair-score">
              <span>
                <strong>{'Meilleur score : '}</strong>
                <span>{attempt.max_score}</span>
              </span>
            </div>}
          <div className="timelineTitle">
            <span className="ordinal">{attempt.ordinal+1}</span>
            {'. '}
            <span className="">
              {attempt.is_training
                ? "Épreuve d'entrainement"
                : <span>
                    {"Épreuve en temps limité ("}
                    {attempt.duration}
                    {" minutes)"}
                  </span>}
            </span>
          </div>
        </div>
        {renderBody(attempt)}
      </div>);
  };

});

