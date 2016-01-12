import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import Tooltip from '../ui/tooltip';
import classnames from 'classnames';

import {PureComponent, toMap} from '../misc';
import {AnswerDialog, Answer} from '../playfair';
import Notifier from '../ui/notifier';
import {RefreshButton} from '../ui/refresh_button';

const AnswersTab = PureComponent(self => {

  const api = Alkindi.api;

  const submitAnswer = function (data) {
    const {user_id, attempt} = self.props;
    api.submitAnswer(user_id, attempt.id, data).then(function (result) {
      self.setState({
        submittedAnswerId: result.answer_id,
        feedback: result.feedback
      });
      Alkindi.refresh();
    });
  };

  const renderAnswers = function (answers) {
    const users = toMap(self.props.users)
    const {submittedAnswerId} = self.state;
    const renderAnswerRow = function (answer) {
      const submitter = users[answer.submitter_id];
      const isCurrent = submittedAnswerId === answer.id;
      const classes = [
        isCurrent && 'rowIsSubmitted'
      ];
      return (
        <tr key={answer.id} className={classnames(classes)}>
          <td className="colIsCurrent">
            {isCurrent &&
              <Tooltip content={<p>Vous venez de soumettre cette réponse.</p>}>
                <i className="fa fa-asterisk"/>
              </Tooltip>}
          </td>
          <td className="colOrdinal">{answer.ordinal}</td>
          <td className="colSubmittedAt">{new Date(answer.created_at).toLocaleString()}</td>
          <td className="colSubmitter">{submitter.username}</td>
          <td className="colAnswer"><Answer answer={answer.answer}/></td>
          <td className="colScore">{answer.score}</td>
          <td className="colIsSolution">
            {answer.is_solution &&
              <Tooltip content={<p>Cette réponse valide l'épreuve, félicitations !</p>}>
                <i className="fa fa-thumbs-o-up"/>
              </Tooltip>}
          </td>
        </tr>
      );
    };
    return (
      <table className="answer-list">
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>Date de soumission</th>
            <th>Auteur</th>
            <th>Réponse</th>
            <th>Score</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {answers.map(renderAnswerRow)}
        </tbody>
      </table>
    );
  };

  self.componentWillMount = function () {
    Alkindi.refresh({'answers': true});
  };

  self.render = function () {
    const {answers} = self.props;
    const {feedback} = self.state;
    const answersBlock =
      (answers === undefined
        ? <p>Chargement en cours...</p>
        : (answers.length == 0
           ? <p className="noRowsMessage">Vous n'avez pas encore soumis de réponse pour cette épreuve.</p>
           : renderAnswers(answers)));
    return (
      <div className="wrapper">
        <div style={{marginBottom: '10px'}}>
          <div className='pull-right'>
            <Tooltip content={<p>Cliquez sur ce bouton pour mettre à jour la liste des réponses soumises par votre équipe.</p>}/>
            {' '}
            <RefreshButton/>
          </div>
        </div>
        <Notifier emitter={api.emitter}/>
        <AnswerDialog answers={answersBlock} submit={submitAnswer} feedback={feedback}/>
      </div>
    );
    // TODO: bouton vers onglet épreuve
  };
}, _self => {
  return {
    submittedAnswerId: undefined,
    feedback: undefined
  };
});

const selector = function (state) {
  const {user_id, attempt, response} = state;
  const {answers, users} = response;
  return {user_id, attempt, answers, users};
};

export default connect(selector)(AnswersTab);
