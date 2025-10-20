module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    'process': 'readonly',
    'console': 'readonly',
    'Buffer': 'readonly',
    'setTimeout': 'readonly',
    'setInterval': 'readonly',
    'clearTimeout': 'readonly',
    'clearInterval': 'readonly'
  },
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-redeclare': 'off'
  }
};
