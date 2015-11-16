var React = require('react');
var Button = require('react-bootstrap').Button;
var Panel = require('react-bootstrap').Panel;

module.exports = React.createClass({
  getDefaultProps: function () {
    return {
      title: 'untitled',
      canClose: false
    };
  },
  propTypes: function () {
    return {
      title: React.PropTypes.string,
      canClose: React.PropTypes.boolean
    };
  },
  render: function () {
    var header = [
      (<Button key="min"><i className="fa fa-minus"></i></Button>), ' ',
      <span key="title">{this.props.title}</span>,
    ];
    if (this.props.canClose)
      header.push(<Button key="close" className="pull-right"><i className="fa fa-times"></i></Button>);
    return (
      <Panel header={header}>
        {this.props.children}
      </Panel>
    );
  }
});
