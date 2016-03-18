import { PropTypes } from 'react';
import { WHITE, BLACK } from '../reducers';

export const pointType = PropTypes.shape({
  color: PropTypes.oneOf([WHITE, BLACK]).isRequired,
  count: PropTypes.number.isRequired,
});
