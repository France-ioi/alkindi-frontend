import React from 'react';

function wrap (elements) {
  return (<span className="code">{elements}</span>);
}

function keyword (key, text) {
  return (<span key={key} className="code-kw">{text}</span>);
}

function variable (key, text) {
  return (<span key={key} className="code-var">{text}</span>);
}

export default {
  wrap,
  keyword,
  variable
};
