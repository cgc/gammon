import React from 'react';
import Board from './board';

const App = React.createClass({
  render() {
    // XXX
    const error = null;
    return (<div>
      <Board />
      { error }
    </div>);
  },
});

export default App;
