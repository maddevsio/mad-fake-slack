module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": "standard",
    "plugins": [
      "html"
    ],
    "settings": {
        "html/html-extensions": [".hbs"],
    },
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "semi": ["error", "always"],
        "quotes": ["error", "double"],
    }
};
