import { handleActions } from 'redux-actions';
import invariant from 'invariant';
import update from 'react-addons-update';
import querystring from 'querystring';

export const WHITE = 'WHITE';
export const BLACK = 'BLACK';

export const WHITE_ON_BAR_INDEX = 0;
export const BLACK_ON_BAR_INDEX = 25;

const parsedQuery = querystring.parse(window.location.search.slice(1));

function newPoint(color = WHITE, count = 0) {
  return { color, count };
}

function emptyState() {
  return {
    points: new Array(26).fill(newPoint()),
    currentPlayer: WHITE,
    turnPhase: 'NEW',
    rolls: [],
    selectedPointIndex: -1,
    home: [
      newPoint(WHITE),
      newPoint(BLACK),
    ],
  };
}

function endGameState() {
  const points = new Array(26).fill(newPoint());
  points[WHITE_ON_BAR_INDEX] = newPoint(WHITE);
  points[BLACK_ON_BAR_INDEX] = newPoint(BLACK);
  points[1] = newPoint(BLACK, 2);
  points[24] = newPoint(WHITE, 1);
  points[19] = newPoint(WHITE, 1);
  return {
    points,
    home: [
      newPoint(WHITE, 5),
      newPoint(BLACK, 8),
    ],
  };
}

function newGamePoints() {
  // These 26 game points represent the 24 visible points as well as 2 points for the
  // "on bar" state for captured checkers.
  return [
    newPoint(WHITE),
    newPoint(WHITE, 2),
    newPoint(),
    newPoint(),
    newPoint(),
    newPoint(),
    newPoint(BLACK, 5),
    newPoint(),
    newPoint(BLACK, 3),
    newPoint(),
    newPoint(),
    newPoint(),
    newPoint(WHITE, 5),
    newPoint(BLACK, 5),
    newPoint(),
    newPoint(),
    newPoint(),
    newPoint(WHITE, 3),
    newPoint(),
    newPoint(WHITE, 5),
    newPoint(),
    newPoint(),
    newPoint(),
    newPoint(),
    newPoint(BLACK, 2),
    newPoint(BLACK),
  ];
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function otherPlayer(currentPlayer) {
  return currentPlayer === WHITE ? BLACK : WHITE;
}

const reducer = handleActions({
  START_GAME: () => ({
    ...emptyState(),
    currentPlayer: WHITE,
    turnPhase: 'ROLL_DICE',
    points: newGamePoints(),
    ...(parsedQuery.end ? endGameState() : {}),
  }),

  ROLL_DICE: (state) => {
    invariant(state.turnPhase === 'ROLL_DICE', 'must be in dice rolling phase to roll dice.');
    const rolls = [
      rollDie(),
      rollDie(),
    ];
    // rolled double!
    if (rolls[0] === rolls[1]) {
      rolls.push(...rolls);
    }
    return {
      ...state,
      turnPhase: 'MOVE_PIECES',
      rolls,
    };
  },

  MOVE_PIECE: (state, action) => {
    const { currentIndex, nextIndex } = action.payload;

    invariant(state.turnPhase === 'MOVE_PIECES', 'must be in move pieces phase to move pieces.');
    const currentPoint = state.points[currentIndex];
    const nextPoint = state.points[nextIndex];
    invariant(currentPoint.count !== 0, 'can only move from points that have checkers');
    invariant(currentPoint.color === state.currentPlayer,
      'can only move pieces of the current player');
    invariant(
      state.currentPlayer === WHITE ? currentIndex < nextIndex : nextIndex < currentIndex,
      'can only move to your home row');
    const diff = Math.abs(currentIndex - nextIndex);

    invariant(diff, 'cannot move a piece to the same spot.'); // handled by action dispatcher
    const rollIndex = state.rolls.findIndex(roll => roll === diff);
    invariant(rollIndex !== -1,
      `you can only move a piece as far as one of your rolls: ${state.rolls.join(', ')}`);
    const nextRolls = state.rolls.filter((roll, index) => index !== rollIndex);

    const newCurrentPoint = {
      ...currentPoint,
      count: currentPoint.count - 1,
    };
    const newNextPoint = { ...nextPoint };
    const onBarPointIndex = otherPlayer(state.currentPlayer) === WHITE ?
      WHITE_ON_BAR_INDEX : BLACK_ON_BAR_INDEX;
    const newOnBarPoint = { ...state.points[onBarPointIndex] };

    if (currentPoint.color === nextPoint.color) {
      newNextPoint.count++;
    } else if (nextPoint.count === 0) {
      newNextPoint.color = state.currentPlayer;
      newNextPoint.count++;
    } else if (nextPoint.count === 1) {
      // because the count on the checker is 1 in this case and we are moving to it, we don't
      // need to update the count.
      newNextPoint.color = state.currentPlayer;
      newOnBarPoint.count++;
    } else {
      throw new Error('cannot move where your opponent has 2 or more checkers.');
    }

    return {
      ...state,
      rolls: nextRolls,
      points: update(state.points, {
        $splice: [
          [currentIndex, 1, newCurrentPoint],
          [nextIndex, 1, newNextPoint],
          [onBarPointIndex, 1, newOnBarPoint],
        ],
      }),
    };
  },

  END_TURN: (state) => ({
    ...state,
    rolls: [],
    currentPlayer: otherPlayer(state.currentPlayer),
    turnPhase: 'ROLL_DICE',
  }),

  SELECT_POINT: (state, action) => ({
    ...state,
    selectedPointIndex: action.payload,
  }),

  DESELECT_POINT: (state) => ({
    ...state,
    selectedPointIndex: -1,
  }),
}, emptyState());

export default reducer;
