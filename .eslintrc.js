module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true
  },
  extends: 'airbnb',
  plugins: [
    'react'
  ],
  rules: {
    'react/prefer-es6-class': 0,
    'react/prefer-stateless-function': 0,
  }
};
