import { createAction } from 'redux-actions';
import { WHITE, WHITE_ON_BAR_INDEX, BLACK_ON_BAR_INDEX } from '../reducers/index';

export const startGame = createAction('START_GAME');
export const movePiece = createAction('MOVE_PIECE');
export const selectPoint = createAction('SELECT_POINT');
export const deselectPoint = createAction('DESELECT_POINT');
export const rollDice = createAction('ROLL_DICE');
export const endTurn = createAction('END_TURN');

export function doMovePiece(currentIndex, nextIndex) {
  return (dispatch, getState) => {
    // end game?
    // move to home row
    // forfeit rolls if not possible
    dispatch(movePiece({ currentIndex, nextIndex }));
    if (!getState().rolls.length) { // XXX detect forefeited rolls
      dispatch(endTurn());
    }
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
        dispatch(deselectPoint());
      }
    }
  };
}
