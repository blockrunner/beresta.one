module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['warn'],
    'no-console': ['warn'],
    'no-debugger': ['error'],
    'prefer-const': ['error'],
    'no-var': ['error'],
    'object-shorthand': ['error'],
    'prefer-template': ['error']
  },
  globals: {
    // Browser globals
    'navigator': 'readonly',
    'document': 'readonly',
    'window': 'readonly',
    'console': 'readonly',
    'fetch': 'readonly',
    'localStorage': 'readonly',
    'sessionStorage': 'readonly',
    
    // Node.js globals
    'process': 'readonly',
    'require': 'readonly',
    'module': 'readonly',
    'exports': 'readonly',
    '__dirname': 'readonly',
    '__filename': 'readonly'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'app/api/node_modules/',
    '*.min.js',
    '*.bundle.js'
  ]
};

