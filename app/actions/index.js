import { createAction } from 'redux-actions';
import {
  WHITE,
  WHITE_ON_BAR_INDEX,
  BLACK_ON_BAR_INDEX,
  hasPlayerWon,
} from '../reducers/index';

export const startGame = createAction('START_GAME');
export const movePiece = createAction('MOVE_PIECE');
export const selectPoint = createAction('SELECT_POINT');
export const deselectPoint = createAction('DESELECT_POINT');
export const rollDice = createAction('ROLL_DICE');
export const endTurn = createAction('END_TURN');
export const movePieceHome = createAction('MOVE_PIECE_HOME');
export const newError = createAction('NEW_ERROR');
export const endGame = createAction('END_GAME');

export function maybeEndTurn() {
  return (dispatch, getState) => {
    if (!getState().rolls.length) {
      dispatch(endTurn());
    }
  };
}

export function doMovePiece(currentIndex, nextIndex) {
  return (dispatch) => {
    try {
      dispatch(movePiece({ currentIndex, nextIndex }));
    } finally {
      dispatch(deselectPoint());
    }
    dispatch(maybeEndTurn());
  };
}

export function clickOnPoint(index) {
  return (dispatch, getState) => {
    const { selectedPointIndex } = getState();
    if (selectedPointIndex === -1) {
      const onBarIndex = getState().currentPlayer === WHITE ?
        WHITE_ON_BAR_INDEX : BLACK_ON_BAR_INDEX;
      if (getState().points[onBarIndex].count) {
        dispatch(doMovePiece(onBarIndex, index));
      } else {
        dispatch(selectPoint(index));
      }
    } else {
      if (selectedPointIndex === index) {
        dispatch(deselectPoint());
      } else {
        dispatch(doMovePiece(selectedPointIndex, index));
      }
    }
  };
}

export function doMovePieceHome(homeColor) {
  return (dispatch, getState) => {
    try {
      dispatch(movePieceHome(homeColor));
    } finally {
      dispatch(deselectPoint());
    }
    if (hasPlayerWon(getState().currentPlayer, getState().points)) {
      dispatch(endGame(getState().currentPlayer));
    } else {
      dispatch(maybeEndTurn());
    }
  };
}

export function forfeitRolls() {
  return (dispatch) => {
    // TODO make sure the forfeit is valid
    dispatch(endTurn());
  };
}
