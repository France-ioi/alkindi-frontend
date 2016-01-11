import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import Tooltip from '../ui/tooltip';
import classnames from 'classnames';

import {PureComponent, toMap} from '../misc';
import {AnswerDialog, Answer} from '../playfair';
import Api from '../api';
import Notifier from '../ui/notifier';
import {RefreshButton} from '../ui/refresh_button';

const AnswersTab = PureComponent(self => {

  const api = Api();
  const notifier = <Notifier api={api}/>;

  const submitAnswer = function (data) {
    const {user_id, attempt} = self.props;
    api.submitAnswer(user_id, attempt.id, data).then(function (result) {
      self.setState({
        submittedAnswerId: result.answer_id
      });
      onRefresh();
    });
  };

  const onRefresh = function () {
    const {attempt} = self.props;
    self.setState({refreshing: true});
    api.listAttemptAnswers(attempt.id).then(
      function (result) {
        self.setState({
          refreshing: false,
          answers: result.answers,
          users: toMap(result.users)
        });
      },
      function () {
        self.setState({refreshing: false});
      });
  };

  const renderAnswers = function (answers) {
    const {users, submittedAnswerId} = self.state;
    const renderAnswerRow = function (answer) {
      const submitter = users[answer.submitter_id];
      const isCurrent = submittedAnswerId === answer.id;
      const classes = [
        isCurrent && 'answer-isSubmitted'
      ];
      return (
        <tr key={answer.id} className={classnames(classes)}>
          <td>
            {isCurrent &&
              <Tooltip content={<p>Vous venez de soumettre cette réponse.</p>}>
                <i className="fa fa-asterisk"/>
              </Tooltip>}
          </td>
          <td>{answer.ordinal}</td>
          <td>{new Date(answer.created_at).toLocaleString()}</td>
          <td>{submitter.username}</td>
          <td><Answer answer={answer.answer}/></td>
          <td>{answer.score}</td>
          <td>
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
    onRefresh();
  };

  self.render = function () {
    const {answers, refreshing} = self.state;
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
            <RefreshButton refresh={onRefresh} refreshing={refreshing}/>
          </div>
        </div>
        {notifier}
        <AnswerDialog answers={answersBlock} submit={submitAnswer}/>
      </div>
    );
  };
}, _self => {
  return {
    refreshing: true,
    answers: undefined,
    submittedAnswerId: undefined
  };
});

export default AnswersTab;
