import { handleActions } from 'redux-actions';
import invariant from 'invariant';
import update from 'react-addons-update';
import querystring from 'querystring';

export const WHITE = 'WHITE';
export const BLACK = 'BLACK';

export const WHITE_ON_BAR_INDEX = 0;
export const BLACK_ON_BAR_INDEX = 25;
export const WHITE_BEARING_OFF_INDICES = new Set([19, 20, 21, 22, 23, 24]);
export const BLACK_BEARING_OFF_INDICES = new Set([1, 2, 3, 4, 5, 6]);

const movementDirection = {
  [WHITE]: 1,
  [BLACK]: -1,
};

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
    mostRecentError: null,
  };
}

function endGameTestState() {
  const points = new Array(26).fill(newPoint());
  points[WHITE_ON_BAR_INDEX] = newPoint(WHITE);
  points[BLACK_ON_BAR_INDEX] = newPoint(BLACK);
  points[1] = newPoint(BLACK, 2);
  points[24] = newPoint(WHITE, 2);
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

function assertCanMoveFrom(currentPlayer, currentPoint) {
  invariant(currentPoint.count !== 0, 'can only move from points that have checkers');
  invariant(currentPoint.color === currentPlayer, 'can only move pieces of the current player');
}

function occupiedPointIndices(currentPlayer, points) {
  return points.reduce((acc, point, index) => {
    if (point.color === currentPlayer && point.count) {
      acc.push(index);
    }
    return acc;
  }, []);
}

export function hasPlayerWon(currentPlayer, points) {
  return !occupiedPointIndices(currentPlayer, points).length;
}

function isPlayerBearingOff(currentPlayer, points) {
  const bearingOff = currentPlayer === WHITE ?
    WHITE_BEARING_OFF_INDICES : BLACK_BEARING_OFF_INDICES;
  return occupiedPointIndices(currentPlayer, points)
    .every(index => bearingOff.has(index));
}

export function computePotentialMoves(selectedPointIndex, currentPlayer, rolls) {
  if (selectedPointIndex === -1) {
    return [];
  }
  const direction = movementDirection[currentPlayer];
  return rolls.map(roll => direction * roll + selectedPointIndex);
}

function withoutRoll(rolls, currentRoll) {
  const rollIndex = rolls.findIndex(roll => roll === currentRoll);
  invariant(rollIndex !== -1,
    `you can only move a piece as far as one of your rolls: ${rolls.join(', ')}`);
  return rolls.filter((roll, index) => index !== rollIndex);
}

const reducer = handleActions({
  START_GAME: () => ({
    ...emptyState(),
    currentPlayer: WHITE,
    turnPhase: 'ROLL_DICE',
    points: newGamePoints(),
    ...(parsedQuery.end ? endGameTestState() : {}),
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
    assertCanMoveFrom(state.currentPlayer, currentPoint);
    invariant(
      (nextIndex - currentIndex) * movementDirection[state.currentPlayer] > 0,
      'can only move towards your home row');
    const diff = Math.abs(currentIndex - nextIndex);

    invariant(diff, 'cannot move a piece to the same spot.'); // handled by action dispatcher
    const nextRolls = withoutRoll(state.rolls, diff);

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

  MOVE_PIECE_HOME: (state, action) => {
    const homeColor = action.payload;
    if (state.selectedPointIndex === -1) {
      return state;
    }
    if (homeColor !== state.currentPlayer) {
      return state;
    }
    if (!isPlayerBearingOff(state.currentPlayer, state.points)) {
      return state;
    }
    invariant(state.turnPhase === 'MOVE_PIECES', 'must be in move pieces phase to move pieces.');
    const currentPoint = state.points[state.selectedPointIndex];
    assertCanMoveFrom(state.currentPlayer, currentPoint);

    const newCurrentPoint = {
      ...currentPoint,
      count: currentPoint.count - 1,
    };

    const currentHomeIndex = state.home
      .findIndex(point => point.color === state.currentPlayer);
    const newHome = {
      ...state.home[currentHomeIndex],
      count: state.home[currentHomeIndex].count + 1,
    };

    const diff = Math.abs(state.selectedPointIndex - (state.currentPlayer === WHITE ?
      BLACK_ON_BAR_INDEX : WHITE_ON_BAR_INDEX));
    const minRoll = Math.min(...state.rolls.filter(roll => diff <= roll));
    const nextRolls = withoutRoll(state.rolls, minRoll);

    return {
      ...state,
      rolls: nextRolls,
      home: update(state.home, {
        $splice: [
          [currentHomeIndex, 1, newHome],
        ],
      }),
      points: update(state.points, {
        $splice: [
          [state.selectedPointIndex, 1, newCurrentPoint],
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

  END_GAME: (state, action) => ({
    ...state,
    turnPhase: action.payload === WHITE ? 'WHITE_WIN' : 'BLACK_WIN',
  }),

  SELECT_POINT: (state, action) => ({
    ...state,
    selectedPointIndex: action.payload,
  }),

  DESELECT_POINT: (state) => ({
    ...state,
    selectedPointIndex: -1,
    mostRecentError: null,
  }),

  NEW_ERROR: (state, action) => ({
    ...state,
    mostRecentError: action.payload,
  }),
}, emptyState());

export default reducer;
