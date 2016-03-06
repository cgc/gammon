import React from 'react';
const { PropTypes } = React;
import Board from './board';
import { connect } from 'react-redux';

const App = React.createClass({
  propTypes: {
    mostRecentError: PropTypes.object,
  },

  render() {
    let error;
    if (this.props.mostRecentError) {
      error = this.props.mostRecentError.message;
    }
    return (<div>
      <Board />
      { error }
    </div>);
  },
});

export default connect((state) => ({
  mostRecentError: state.mostRecentError,
}))(App);
