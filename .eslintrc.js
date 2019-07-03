module.exports = {
  "extends": ["airbnb-base/legacy"],
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jest": true
  },
  "plugins": ["jest", "html" ],
  "settings": {
    "html/html-extensions": [".hbs"],
  },
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly",
    "page": true,
    "browser": true,
    "context": true,
    "jestPuppeteer": true,
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
    "no-restricted-syntax": "warn",
    "max-len": [
      2,
      180,
      8
    ]
  }
};
