import React from 'react';
import ReactDOM from 'react-dom';

import DisplayText from './tools-react/displayText';

const app = (
   <DisplayText alphabet={playFair.alphabet} outputCipheredText={playFair.sampleCipheredText} outputCipheredTextVariable="texteChiffré" />
);
const container = document.getElementById('react-container');
ReactDOM.render(app, container);
