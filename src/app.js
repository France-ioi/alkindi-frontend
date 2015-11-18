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
import Shuffle from 'shuffle';

import Tool from './tool';
// import { createStore } from 'redux';

// Insert stylesheets.
[
  'bootstrap/dist/css/bootstrap.min.css',
  'font-awesome/css/font-awesome.min.css'
].forEach(function (css_path) {
  insertStylesheet('../node_modules/' + css_path);
});
require('./app.css');

// Generate a sample cipher-text.
const clear_text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies vel massa in aliquam. Integer vel venenatis dui, non rutrum justo.Mauris sed eros fringilla ex fringilla dapibus. Vivamus tincidunt venenatis sapien eget mattis. Integer molestie pretium ante ac finibus. Donec non nisi dignissim, bibendum nisi sed, sodales magna. Sed vel massa non libero interdum convallis vitae eu leo. Phasellus consequat tellus nec arcu blandit, dignissim faucibus orci malesuada. Mauris tempus ligula vel purus pellentesque, ac ultricies urna porttitor. Nulla facilisi. Cras maximus lorem quis ipsum luctus, eu cursus nulla efficitur. Fusce accumsan porta vestibulum.".toLowerCase();
window.alphabet = Array.apply(null, {length: 26}).map(function (_, i) { return String.fromCharCode(97 + i); });
window.indices = window.alphabet.map(function (_, i) { return i; });
window.permutation = Shuffle.shuffle({deck: window.indices}).cards;
const cipher_text = clear_text.split('').map(function (c) {
  const i = window.alphabet.indexOf(c);
  return i === -1 ? c : window.alphabet[window.permutation[i]];
}).join('');

// Insert HTML.
const mainElement = document.getElementById('main');
ReactDOM.render(
  <div>
    <Tool type='TextInput' title="Texte chiffré" text={cipher_text} />
    <Tool type='Hints' title="Indices" />
    <Tool type='Substitution' title="Substitution" inputVar="foo" outputVar="bar" substitution="abcdefghijklmnopqrstuvwxyz" />
  </div>, mainElement);
