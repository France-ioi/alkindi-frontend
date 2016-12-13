import React from 'react';
import {connect} from 'react-redux';
import {Button} from 'react-bootstrap';

import {PureComponent} from '../misc';
import Notifier from '../ui/notifier';
import RefreshButton from '../ui/refresh_button';
import Tooltip from '../ui/tooltip';
import AttemptTimeline from '../ui/attempt_timeline';
import {setActiveTab} from '../actions';

const AttemptsTab = PureComponent(self => {

  const accessCodes = {};

  const refAccessCode = function (element) {
    if (element) {
      const user_id = element.getAttribute('data-user_id');
      accessCodes[user_id] = element;
    }
  };

  const clearAccessCode = function () {
    self.setState({access_code: undefined});
  };

  const onSwitchTab = function (tabKey) {
    self.props.dispatch(setActiveTab(tabKey));
  };

  const onEnterAccessCode = function (event) {
    const user_id = self.props.user.id;
    const code_user_id = event.currentTarget.getAttribute('data-user_id');
    const element = accessCodes[code_user_id];
    const code = element.value.trim();
    element.value = '';
    self.props.alkindi.api.enterAccessCode(user_id, {code: code, user_id: code_user_id});
  };

  const renderCodeEntry = function () {
    const {team} = self.props;
    const renderMember = function (member) {
      const user_id = member.user_id;
      return (
        <tr key={user_id}>
          <td>{member.user.username}</td>
          <td>{member.user.lastname}, {member.user.firstname}</td>
          {(member.access_code === undefined
            ? <td className="access-code">
                <input type="text" data-user_id={user_id} ref={refAccessCode} />
                <Button bsSize="small" onClick={onEnterAccessCode} data-user_id={user_id}>
                  <i className="fa fa-check"/> valider
                </Button>
              </td>
            : <td className="unlocked-code">{member.access_code}</td>)}
        </tr>);
    };
    return (
      <div className="section">
        <p>Pour autoriser l'accès au sujet, vous devez saisir des codes de
           lancement.</p>
        <p>Voici la composition de votre équipe :</p>
        <table className="table">
          <tbody>
            <tr>
              <th>Login</th>
              <th>Nom, prénom</th>
              <th>Code de lancement du sujet</th>
            </tr>
            {team.members.map(renderMember)}
          </tbody>
        </table>
      </div>
    );
  };

  const getMaxScore = function (attempts) {
    let max_score;
    attempts.forEach(function (attempt) {
      // The attempt's max_score may be null (no score) or undefined
      // (synthetic attempt).  If there is a score it will be a non-
      // empty string, which is truthy.
      if (!attempt.is_training && attempt.max_score) {
        // Parse max_score as it is a decimal type sent as a string.
        const score = parseInt(attempt.max_score);
        if (max_score === undefined || score > max_score)
          max_score = score;
      }
    });
    return max_score;
  };

  self.componentWillMount = function () {
    selp.props.alkindi.api.emitter.on('refresh', clearAccessCode);
  };

  self.componentWillUnmount = function () {
    selp.props.alkindi.api.emitter.removeListener('refresh', clearAccessCode);
  };

  self.render = function () {
    const {alkindi, user, round, team, attempt, attempts} = self.props;
    const codeEntry = attempt && attempt.needs_codes;
    const score = round.hide_scores ? null : getMaxScore(attempts);
    const noTraining = round.max_attempts === null;
    // or noTraining = !!attempts.find(attempt => attempt.is_training)
    return (
      <div className="wrapper">
        <div className="pull-right">
          <Tooltip content={<p>Cliquez sur ce bouton pour recharger la situation de vos épreuves.</p>}/>
          {' '}
          <RefreshButton alkindi={alkindi}/>
        </div>
        <Notifier alkindi={alkindi}/>
        <h1>{round.title}</h1>
        {noTraining &&
          <p>
            Pour ce tour, il n'y a pas d'épreuve d'entraînement.
            Vous pouvez faire autant de tentatives en temps limité que
            vous le souhaitez.
            Votre score sera celui de la meilleure de vos tentatives.
          </p>}
        {round.id === 4 && <div>
          <p>
            Pour ce tour, il n'y a qu'une seule épreuve, sans limite de temps.
            Votre score sera celui de votre dernière réponse, mais vous ne le
            connaîtrez qu'après la fin du concours le 26 mars.
          </p>
          <p>
            <strong>Attention :</strong> ce que vous faites pendant la première
            heure et demie après avoir démarré l'épreuve sera utilisé pour
            départager les ex-aequo. Allez voir le <a
            href="http://concours-alkindi.fr/#/pageManual" target="_blank">manuel
            du concours</a> pour les détails.
          </p>
          <p>
            En résumé : faites en un maximum pendant la première heure et demie
            après avoir démarré l'épreuve, en soumettant votre réponse à chaque
            fois que vous pensez avoir déchiffré correctement une information de
            plus.
            Une fois la première heure et demie écoulée, vous avez jusqu'au
            26 mars pour compléter votre réponse.
          </p>
        </div>}
        {typeof score == 'number' &&
          <p className="team-score">
              Score actuel de l'équipe (meilleur score parmi les épreuves
              en temps limité) : <span className="team-score">{score}</span>.
            </p>}
        {codeEntry && renderCodeEntry()}
        {attempts &&
          <div className="attempts">
            {attempts.map(attempt => <AttemptTimeline alkindi={alkindi} key={attempt.ordinal} attempt={attempt} round={round} team={team} user={user} onSwitchTab={onSwitchTab}/>)}
          </div>}
      </div>
    );
  };
});

const selector = function (state, _props) {
  const {user, team, round, attempts} = state.response;
  const {attempt} = state;
  return {user, team, round, attempt, attempts};
};

export default connect(selector)(AttemptsTab);
