import React from 'react';
import range from 'node-range';
import {Button,DropdownButton,MenuItem} from 'react-bootstrap';

import {substString,toIndices,toChar} from '../alpha';

const ExpandToggleButton = React.createClass({
  render: function () {
    return (<Button>±</Button>);
  }
});

const SelectVariable = React.createClass({
  propTypes: function () {
    return {
      variable: React.PropTypes.string.isRequired
    };
  },
  render: function () {
    // TODO: get list of existing variables from state
    return (
      <DropdownButton id="FIXME" bsSize="small" title={this.props.variable}>
        <MenuItem eventKey="var1">var1</MenuItem>
        <MenuItem eventKey="var2">var2</MenuItem>
        <MenuItem eventKey="var3">var3</MenuItem>
      </DropdownButton>);
  }
});

export default React.createClass({
  getInitialState: function () {
    // TODO: store collapsed state in global state
    return {
      collapsed: {
        input: false,
        substitution: false,
        output: false
      }
    };
  },
  getDefaultProps: function () {
    return {
      title: 'Substitution'
    };
  },
  propTypes: function () {
    return {
      inputVar: React.PropTypes.string.isRequired,
      substitution: React.PropTypes.string.isRequired,
      outputVar: React.PropTypes.string.isRequired
    };
  },
  render: function () {
    const items = [];

    // TODO: mode that shows hints (known target letter) in grey
    // TODO: selecting a target letter and typing another letter exchanges
    //       the two letters.
    // TODO: drag & drop also allows exchanging letters.
    const input = "abcdef";
    const substitution = toIndices(this.props.substitution);
    const output = substString(substitution, input);

    // input section
    items.push(
      <div key='input'>
        <div>
          <ExpandToggleButton collapsed={this.state.collapsed.input} eventKey='input' onClick={this.toggleExpand} />
          <span>Texte d'origine</span>
        </div>
        <div>
          <span>Issu de la variable :</span>
          <SelectVariable variable={this.props.inputVar} mustExist={true} onSelect={this.setInputVar} />
        </div>
        <div className="char-base cipher">abcdef</div>
      </div>);

    // substitution section
    const mapping = range(0, 26).map(function (i) {
      let d = substitution[i];
      return (
        <div key={i} className="char-pairs">
          <span className="char-base cipher">{toChar(i)}</span>
          <span className="char-subs">{toChar(d)}</span>
        </div>
      );
    });
    items.push(
      <div key='substitution'>
        <div>
          <ExpandToggleButton eventKey='substitution' onClick={this.toggleExpand} />
          <span>Substitution</span>
        </div>
        <div>
          <div className="clearfix">{mapping}</div>
        </div>
      </div>);

    // output section
    items.push(
      <div key='output'>
        <div>
          <ExpandToggleButton eventKey='output' onClick={this.toggleExpand} />
          <span>Texte après substitution</span>
        </div>
        <div className="char-base">abcdef</div>
        <div>
          <span>Stocké dans la variable :</span>
          <SelectVariable variable={this.props.outputVar} mustExist={false} onSelect={this.setOutputVar} />
        </div>
      </div>);

    return (<div className="substitution-tool">{items}</div>);
  },
  collapsible: function (section, title, bodyBuilder) {
    if (this.state.collapsed[section]) {
      // collapsed version
      return (
        <div key={section}>
          <ExpandButton eventKey={section} onClick={this.onExpandItem} />
          <span>{title}</span>
        </div>);
    } else {
      // expanded version
      const minimize = (
        <div key={section}>
          <CollapseButton eventKey={section} onChange={this.onCollapseItem} />
          <span>{title}</span>
        </div>);
      return (
        <div key={section}>
          {minimize}
          {bodyBuilder()}
        </div>);
    }
  },
  setInputVar: function () {
    // TODO
  },
  setOutputVar: function () {
    // TODO
  },
  onExpandItem: function () {
    // TODO: set state
  },
  onCollapseItem: function () {
    // TODO: set state
  }
});
