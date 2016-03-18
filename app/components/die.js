import React from 'react';
const PropTypes = React.PropTypes;
import classnames from 'classnames';

require('../styles/Die.css');

const faceToDotClasses = {
  1: [
    ['DieDot-verticalMiddle', 'DieDot-horizontalMiddle'],
  ],
  2: [
    ['DieDot-verticalTop', 'DieDot-horizontalLeft'],
    ['DieDot-verticalBottom', 'DieDot-horizontalRight'],
  ],
  3: [
    ['DieDot-verticalTop', 'DieDot-horizontalLeft'],
    ['DieDot-verticalMiddle', 'DieDot-horizontalMiddle'],
    ['DieDot-verticalBottom', 'DieDot-horizontalRight'],
  ],
  4: [
    ['DieDot-verticalTop', 'DieDot-horizontalLeft'],
    ['DieDot-verticalTop', 'DieDot-horizontalRight'],
    ['DieDot-verticalBottom', 'DieDot-horizontalLeft'],
    ['DieDot-verticalBottom', 'DieDot-horizontalRight'],
  ],
  5: [
    ['DieDot-verticalTop', 'DieDot-horizontalLeft'],
    ['DieDot-verticalTop', 'DieDot-horizontalRight'],
    ['DieDot-verticalMiddle', 'DieDot-horizontalMiddle'],
    ['DieDot-verticalBottom', 'DieDot-horizontalLeft'],
    ['DieDot-verticalBottom', 'DieDot-horizontalRight'],
  ],
  6: [
    ['DieDot-verticalTop', 'DieDot-horizontalLeft'],
    ['DieDot-verticalTop', 'DieDot-horizontalRight'],
    ['DieDot-verticalMiddle', 'DieDot-horizontalLeft'],
    ['DieDot-verticalMiddle', 'DieDot-horizontalRight'],
    ['DieDot-verticalBottom', 'DieDot-horizontalLeft'],
    ['DieDot-verticalBottom', 'DieDot-horizontalRight'],
  ],
};

export const Die = React.createClass({
  propTypes: {
    face: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired,
  },

  render() {
    const dots = faceToDotClasses[this.props.face].map(classes =>
      <div className={ classnames('DieDot', classes) } />
    );
    return (<span className="Die">
      { dots }
    </span>);
  },
});
