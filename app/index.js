import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import reducer from './reducers';
import { Provider } from 'react-redux';
import App from './components/app';
import thunk from 'redux-thunk';

const store = createStore(reducer, applyMiddleware(thunk));

require('./styles/index.css');

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('content')
);
