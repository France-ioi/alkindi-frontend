'use strict';

// IE8 compatibility:
require('html5shiv');
require('es5-shim');
require('es5-sham-ie8');
// Use el.getAttribute('data-value') rather than el.dataset.value.

import React from 'react';
import ReactDOM from 'react-dom';
import insertStylesheet from 'insert-stylesheet';
import Shuffle from 'shuffle';

import Tool from './tool';

// Insert stylesheets.
[
  'bootstrap/dist/css/bootstrap.min.css',
  'font-awesome/css/font-awesome.min.css'
].forEach(function (css_path) {
  insertStylesheet('../node_modules/' + css_path);
});
require('./app.css');

// Generate a sample cipher-text.
var clear_text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies vel massa in aliquam. Integer vel venenatis dui, non rutrum justo.Mauris sed eros fringilla ex fringilla dapibus. Vivamus tincidunt venenatis sapien eget mattis. Integer molestie pretium ante ac finibus. Donec non nisi dignissim, bibendum nisi sed, sodales magna. Sed vel massa non libero interdum convallis vitae eu leo. Phasellus consequat tellus nec arcu blandit, dignissim faucibus orci malesuada. Mauris tempus ligula vel purus pellentesque, ac ultricies urna porttitor. Nulla facilisi. Cras maximus lorem quis ipsum luctus, eu cursus nulla efficitur. Fusce accumsan porta vestibulum.";
clear_text = clear_text.toLowerCase();
var alphabet = Array.apply(null, {length: 26}).map(function (_, i) { return String.fromCharCode(97 + i); });
var permutation = Shuffle.shuffle({deck: alphabet}).cards;
var cipher_text = clear_text.split('').map(function (c) {
  var i = alphabet.indexOf(c);
  return i === -1 ? c : permutation[i];
}).join('');

// Insert HTML.
var mainElement = document.getElementById('main');
ReactDOM.render(
  <div>
    <TextInput title="Texte chiffré" text={cipher_text} />
  </div>, mainElement);
