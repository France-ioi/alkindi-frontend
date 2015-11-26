import React from 'react';

function wrap (elements) {
  return (<span className="code">{elements}</span>);
}

function keyword (text) {
  return (<span className="code-kw">{text}</span>);
}

function variable (text) {
  return (<span className="code-var">{text}</span>);
}

export default {
  wrap,
  keyword,
  variable
};
