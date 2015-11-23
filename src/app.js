'use strict';

// IE8 compatibility:
require('html5shiv');
require('es5-shim');
require('es5-sham-ie8');
// Use el.getAttribute('data-value') rather than el.dataset.value.

import React from 'react';
React; // silence eslint no-unused-vars
import ReactDOM from 'react-dom';
import insertStylesheet from 'insert-stylesheet';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import Shuffle from 'shuffle';
import range from 'node-range';

import {renderTool} from './tool';
import * as values from './values';
import reducer from './reducer';
import {toChar} from './alpha';

// Insert stylesheets.
[
  'bootstrap/dist/css/bootstrap.min.css',
  'font-awesome/css/font-awesome.min.css'
].forEach(function (css_path) {
  insertStylesheet('../node_modules/' + css_path);
});
require('./app.css');

// Create the global state store.
let store = createStore(reducer);

// Fire some actions to set up the environments.
[
  {
    type: 'DEFINE_ALPHABET',
    name: 'letters',
    symbols: range(0, 26).map(function (i) { return String.fromCharCode(65 + i); }),
    pattern: '[A-Z]'
  },
  {
    type: 'IMPORT_TEXT',
    name: 'cleartext',
    alphabet: 'letters',
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies vel massa in aliquam. Integer vel venenatis dui, non rutrum justo.Mauris sed eros fringilla ex fringilla dapibus. Vivamus tincidunt venenatis sapien eget mattis. Integer molestie pretium ante ac finibus. Donec non nisi dignissim, bibendum nisi sed, sodales magna. Sed vel massa non libero interdum convallis vitae eu leo. Phasellus consequat tellus nec arcu blandit, dignissim faucibus orci malesuada. Mauris tempus ligula vel purus pellentesque, ac ultricies urna porttitor. Nulla facilisi. Cras maximus lorem quis ipsum luctus, eu cursus nulla efficitur. Fusce accumsan porta vestibulum.".toUpperCase(),
    qualifier: 'given'
  },
  {
    type: 'IMPORT_SUBSTITUTION',
    name: 'cipher',
    sourceAlphabet: 'letters',
    targetAlphabet: 'letters',
    pairs: Shuffle.shuffle({deck: range(0, 26).toArray()}).cards.map(function (i) {
      return {i: i, q: 'given'};
    })
  },
  {
    type: 'COMPUTE',
    operation: 'substitute',
    source: 'cleartext',
    substitution: 'cipher',
    destination: 'ciphertext'
  }
].forEach(function (action) { store.dispatch(action); });

let selector = function (state) {
  return {
    state: state
  };
}

let App = connect(selector)(React.createClass({
  render: function () {
    const {state} = this.props;
    var tool1 = renderTool({
      state: state,
      props: {
        type: 'TextDisplay',
        title: "Texte clair"
      },
      lookup: {
        text: 'cleartext'
      }
    });
    var tool2 = renderTool({
      state: state,
      props: {
        type: 'TextDisplay',
        title: "Texte chiffré"
      },
      lookup: {
        text: 'ciphertext'
      }
    });
    return (
      <div>
        <div key='1'>{tool1}</div>
        <div key='2'>{tool2}</div>
      </div>);
  }
}));

// <Tool type='Hints' title="Indices" score={this.props.score} maxScore={this.props.maxScore} alphabets={this.props.alphabets} clearAlphabet="letters" codedAlphabet="letters" hints={this.props.hints} />
// <Tool type='Substitution' title="Substitution" inputVar="foo" outputVar="bar" substitution="abcdefghijklmnopqrstuvwxyz" />


// Insert HTML.
const mainElement = document.getElementById('main');
ReactDOM.render(<Provider store={store}><App/></Provider>, mainElement);
