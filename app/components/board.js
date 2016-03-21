import React from 'react';
const PropTypes = React.PropTypes;
import classnames from 'classnames';
import { connect } from 'react-redux';
import { Checker } from './checker';
import { Die } from './die';
import {
  clickOnPoint, rollDice, startGame, doMovePieceHome, forfeitRolls,
  deselectPoint,
} from '../actions';
import {
  WHITE, BLACK, WHITE_ON_BAR_INDEX, BLACK_ON_BAR_INDEX, computePotentialMoves,
} from '../reducers';
import { pointType } from './types';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

require('../styles/Board.css');

const CHECKER = 'checker';

const DraggableChecker = DragSource(CHECKER, { // eslint-disable-line new-cap
  beginDrag(props) {
    // need to deselect before we "click" on the current point, otherwise we
    // might move to the current point.
    props.deselectPoint();
    props.clickOnPoint();
    return {
      pointIndex: props.pointIndex,
    };
  },
}, (dragConnect, monitor) => ({
  connectDragSource: dragConnect.dragSource(),
  isDragging: monitor.isDragging(),
}))(React.createClass({
  propTypes: {
    isDragging: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired,
  },

  render() {
    const style = {
      opacity: this.props.isDragging ? 0.5 : 1,
    };
    return this.props.connectDragSource(<div style={ style }>
      <Checker {...this.props} />
    </div>);
  },
}));

export const BoardPoint = React.createClass({
  propTypes: {
    point: pointType.isRequired,
    index: PropTypes.number.isRequired,
    isHighlighted: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    deselectPoint: PropTypes.func.isRequired,
  },

  render() {
    const { point, index } = this.props;

    const pointsUp = index < 13;

    const classname = classnames('Board-point', {
      'Board--evenPoint': index % 2 === 0,
      'Board--oddPoint': index % 2 !== 0,
      'Board--pointsUp': pointsUp,
      'Board--pointsDown': !pointsUp,
      'is-selected': this.props.isSelected,
      'is-highlighted': this.props.isHighlighted,
    });

    const checkerMargin = 8;
    const checkers = Array(point.count).fill(null).map((item, checkerIndex) => {
      const style = {};
      if (pointsUp) {
        style.marginBottom = checkerIndex * checkerMargin;
      } else {
        style.marginTop = checkerIndex * checkerMargin;
      }
      return (
        <div key={ checkerIndex } className="Board-checker">
          <DraggableChecker point={ point } hideCount style={ style }
            pointIndex={ index } clickOnPoint={ this.props.onClick }
            deselectPoint={ this.props.deselectPoint }
          />
        </div>
      );
    });
    return this.props.connectDropTarget(<div className={ classname }
      onClick={ this.props.onClick }
    >
      <div className="Board-pointArrow"></div>
      { checkers }
    </div>);
  },
});

const BoardPointTarget = DropTarget(CHECKER, { // eslint-disable-line new-cap
  drop(props, monitor) {
    props.onClick();
    return {
      from: monitor.getItem().pointIndex,
      to: props.index,
    };
  },
}, (dropConnect, monitor) => ({
  connectDropTarget: dropConnect.dropTarget(),
  isOver: monitor.isOver(),
}))(BoardPoint);

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
    deselectPoint: PropTypes.func.isRequired,
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
      <Checker point={ point } canBeDisabled={ false } />
    </div>);
  },

  render() {
    const potentialMoves = computePotentialMoves(this.props.selectedPointIndex,
      this.props.currentPlayer, this.props.rolls);

    // we slice when rendering here so that we can exclude the bar from rendering
    const points = this.props.points.slice(WHITE_ON_BAR_INDEX + 1, BLACK_ON_BAR_INDEX)
    .map((point, _index) => {
      // We adjust the current index by 1 because we slice when rendering.
      const index = _index + 1;
      const onClick = this.props.clickOnPoint.bind(null, index);
      return (<BoardPointTarget key={ index } point={ point } index={ index }
        isSelected={ this.props.selectedPointIndex === index }
        isHighlighted={ potentialMoves.includes(index) }
        onClick={ onClick }
        deselectPoint={ this.props.deselectPoint }
      />);
    });

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
        <div><Checker point={ this.props.points[WHITE_ON_BAR_INDEX] } /></div>
        <div><Checker point={ this.props.points[BLACK_ON_BAR_INDEX] } /></div>
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
      const rolls = this.props.rolls.map(roll => <Die face={ roll } />);
      action = (<div>
        <div>Rolls: { rolls }</div>
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
        <div>
          { status }
          { action }
        </div>
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
  deselectPoint: () => dispatch(deselectPoint()),
}))(DragDropContext(HTML5Backend)(Board)); // eslint-disable-line new-cap
