import React from 'react';
const PropTypes = React.PropTypes;
import classnames from 'classnames';
import { connect } from 'react-redux';
import {
  clickOnPoint, rollDice, startGame, doMovePieceHome, forfeitRolls,
} from '../actions';
import {
  WHITE, BLACK, WHITE_ON_BAR_INDEX, BLACK_ON_BAR_INDEX,
} from '../reducers';

require('../styles/Board.css');
require('../styles/Checker.css');

const pointType = PropTypes.shape({
  color: PropTypes.oneOf([WHITE, BLACK]).isRequired,
  count: PropTypes.number.isRequired,
});

export const Board = React.createClass({
  propTypes: {
    points: PropTypes.arrayOf(pointType.isRequired),
    home: PropTypes.arrayOf(pointType.isRequired),
    rolls: PropTypes.arrayOf(PropTypes.number).isRequired,
    currentPlayer: PropTypes.oneOf([WHITE, BLACK]).isRequired,
    turnPhase: PropTypes.oneOf([
      'NEW', 'ROLL_DICE', 'MOVE_PIECES', 'WHITE_WIN', 'BLACK_WIN',
    ]).isRequired,
    selectedPointIndex: PropTypes.number.isRequired,

    // bound actions
    clickOnPoint: PropTypes.func.isRequired,
    rollDice: PropTypes.func.isRequired,
    startGame: PropTypes.func.isRequired,
    movePieceHome: PropTypes.func.isRequired,
    forfeitRolls: PropTypes.func.isRequired,
  },

  _renderChecker(point, options = { canBeDisabled: true }) {
    const checkerClassame = classnames('Checker', {
      'Checker--white': point.color === WHITE,
      'Checker--black': point.color === BLACK,
      'is-disabled': point.count === 0 && options.canBeDisabled,
    });
    return (<div className={ checkerClassame }>
      { point.count }
    </div>);
  },

  _renderHome(point) {
    let onClick;
    if (point.color === this.props.currentPlayer) {
      onClick = this.props.movePieceHome.bind(null, point.color);
    }
    const classname = classnames({
      'Board-whiteHome': point.color === WHITE,
      'Board-blackHome': point.color === BLACK,
    });
    return (<div className={ classname } onClick={ onClick }>
      { this._renderChecker(point, { canBeDisabled: false }) }
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

    const endGamePhases = ['WHITE_WIN', 'BLACK_WIN'];

    let action;
    if (this.props.turnPhase === 'ROLL_DICE') {
      action = <button onClick={ this.props.rollDice }>Roll dice</button>;
    } else if (this.props.turnPhase === 'MOVE_PIECES') {
      action = (<div>
        <div>Rolls: { this.props.rolls.join(' ') }</div>
        <button onClick={ this.props.forfeitRolls }>Give up</button>
      </div>);
    } else if (['NEW'].concat(endGamePhases).includes(this.props.turnPhase)) {
      action = <button onClick={ this.props.startGame }>Start game</button>;
    }

    let statusColor = this.props.currentPlayer;
    let message = 'Current';
    if (endGamePhases.includes(this.props.turnPhase)) {
      statusColor = this.props.turnPhase === 'WHITE_WIN' ? WHITE : BLACK;
      message = 'WINNER';
    }

    const statusClassname = classnames('Board-playerStatus', {
      'Board-playerStatusWhite': statusColor === WHITE,
      'Board-playerStatusBlack': statusColor === BLACK,
    });
    const status = (<div className={ statusClassname }>
      { message }: { statusColor }
    </div>);

    const whiteHome = this.props.home.find(point => point.color === WHITE);
    const blackHome = this.props.home.find(point => point.color === BLACK);

    return (<div className="Board">
      { renderedPoints }
      <div className="Board-homes">
        { this._renderHome(whiteHome) }
        { status }
        { action }
        { this._renderHome(blackHome) }
      </div>
    </div>);
  },
});

export default connect((state) => ({
  points: state.points,
  home: state.home,
  currentPlayer: state.currentPlayer,
  turnPhase: state.turnPhase,
  rolls: state.rolls,
  selectedPointIndex: state.selectedPointIndex,
}), (dispatch) => ({
  clickOnPoint: payload => dispatch(clickOnPoint(payload)),
  movePieceHome: payload => dispatch(doMovePieceHome(payload)),
  rollDice: () => dispatch(rollDice()),
  startGame: () => dispatch(startGame()),
  forfeitRolls: () => dispatch(forfeitRolls()),
}))(Board);
