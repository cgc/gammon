import React from 'react';
const PropTypes = React.PropTypes;
import classnames from 'classnames';
import { connect } from 'react-redux';
import { clickOnPoint, rollDice, startGame } from '../actions';
import { WHITE, BLACK, WHITE_ON_BAR_INDEX, BLACK_ON_BAR_INDEX } from '../reducers';

require('../styles/Board.css');
require('../styles/Checker.css');

export const Board = React.createClass({
  propTypes: {
    points: PropTypes.arrayOf(PropTypes.shape({
      color: PropTypes.oneOf([WHITE, BLACK]).isRequired,
      count: PropTypes.number.isRequired,
    }).isRequired),
    rolls: PropTypes.arrayOf(PropTypes.number).isRequired,
    currentPlayer: PropTypes.oneOf([WHITE, BLACK]).isRequired,
    turnPhase: PropTypes.oneOf(['NEW', 'ROLL_DICE', 'MOVE_PIECES']).isRequired,
    selectedPointIndex: PropTypes.number.isRequired,

    // bound actions
    clickOnPoint: PropTypes.func.isRequired,
    rollDice: PropTypes.func.isRequired,
    startGame: PropTypes.func.isRequired,
  },

  _renderChecker(point) {
    const checkerClassame = classnames('Checker', {
      'Checker--white': point.color === WHITE,
      'Checker--black': point.color === BLACK,
    });
    return (<div className={ checkerClassame }>
      { point.count }
    </div>);
  },

  _renderPoint(point, index) {
    const classname = classnames('Board-point', {
      'Board-evenPoint': index % 2 === 0,
      'Board-oddPoint': index % 2 !== 0,
      'Board-selectedPoint': this.props.selectedPointIndex === index,
    });
    const onClick = this.props.clickOnPoint.bind(null, index);
    let checker;
    if (point.count) {
      checker = this._renderChecker(point);
    }
    return (<div key={ index } className={ classname } onClick={ onClick }>
      <div className="Board-pointArrow"></div>
      <div className="Board-checker">{ checker }</div>
    </div>);
  },

  render() {
    const points = this.props.points.slice(WHITE_ON_BAR_INDEX + 1, BLACK_ON_BAR_INDEX)
    .map((point, index) => this._renderPoint(point, index + 1));

    const lowerRightPoints = points.slice(0, 6);
    lowerRightPoints.reverse();
    const lowerLeftPoints = points.slice(6, 12);
    lowerLeftPoints.reverse();

    const renderedPoints = (<div className="Board-points">
      <div className="Board-half">
        <div className="Board-quadrant">{ points.slice(12, 18) }</div>
        <div className="Board-quadrant">{ lowerLeftPoints }</div>
      </div>
      <div className="Board-bar">
        <div>{ this._renderChecker(this.props.points[WHITE_ON_BAR_INDEX]) }</div>
        <div>{ this._renderChecker(this.props.points[BLACK_ON_BAR_INDEX]) }</div>
      </div>
      <div className="Board-half">
        <div className="Board-quadrant">{ points.slice(18, 24) }</div>
        <div className="Board-quadrant">{ lowerRightPoints }</div>
      </div>
    </div>);

    let action;
    if (this.props.turnPhase === 'ROLL_DICE') {
      action = <button onClick={ this.props.rollDice }>Roll dice</button>;
    } else if (this.props.turnPhase === 'MOVE_PIECES') {
      action = <div>Rolls: { this.props.rolls.join(' ') }</div>;
    } else if (this.props.turnPhase === 'NEW') {
      action = <button onClick={ this.props.startGame }>Start game</button>;
    }

    const currentPlayerClassname = classnames('Board-currentPlayer', {
      'Board-currentPlayerWhite': this.props.currentPlayer === WHITE,
      'Board-currentPlayerBlack': this.props.currentPlayer === BLACK,
    });
    const current = (<div className={ currentPlayerClassname }>
      Current: { this.props.currentPlayer }</div>);

    return (<div className="Board">
      { renderedPoints }
      <div className="Board-homes">
        <div className="Board-whiteHome"></div>
        { current }
        { action }
        <div className="Board-blackHome"></div>
      </div>
    </div>);
  },
});

export default connect((state) => ({
  points: state.points,
  currentPlayer: state.currentPlayer,
  turnPhase: state.turnPhase,
  rolls: state.rolls,
  selectedPointIndex: state.selectedPointIndex,
}), (dispatch) => ({
  clickOnPoint: payload => dispatch(clickOnPoint(payload)),
  rollDice: () => dispatch(rollDice()),
  startGame: () => dispatch(startGame()),
}))(Board);
