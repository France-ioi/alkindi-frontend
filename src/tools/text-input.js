import React from 'react';

module.exports = React.createClass({
  getInitialState: function () {
    return {};
  },
  getDefaultProps: function () {
    return {
      title: 'Text input'
    };
  },
  propTypes: function () {
    return {
      title: React.PropTypes.string,
      text: React.PropTypes.string.isRequired
    };
  },
  render: function () {
    return (
      <textarea readOnly className='cipher' value={this.props.text}/>
    );
  }
});
