import React from 'react';

export default React.createClass({
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
      <textarea readOnly className='cipher' cols="120" rows="6" value={this.props.text}/>
    );
  }
});
