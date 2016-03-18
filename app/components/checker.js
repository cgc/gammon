import React from 'react';
const PropTypes = React.PropTypes;
import classnames from 'classnames';
import { WHITE, BLACK } from '../reducers';
import { pointType } from './types';

require('../styles/Checker.css');

export const Checker = React.createClass({
  propTypes: {
    point: pointType.isRequired,
    style: PropTypes.object.isRequired,
    hideCount: PropTypes.bool.isRequired,
    canBeDisabled: PropTypes.bool.isRequired,
  },

  getDefaultProps() {
    return {
      hideCount: false,
      canBeDisabled: true,
      style: {},
    };
  },

  render() {
    const { point } = this.props;
    const checkerClassame = classnames('Checker', {
      'Checker--white': point.color === WHITE,
      'Checker--black': point.color === BLACK,
      'is-disabled': point.count === 0 && this.props.canBeDisabled,
    });
    const count = this.props.hideCount ? null : point.count;
    return (<div style={ this.props.style } className={ checkerClassame }>
      { count }
    </div>);
  },
});
