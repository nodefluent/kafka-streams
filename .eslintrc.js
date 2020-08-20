module.exports = {
  "env": {
    "es6": true,
    "node": true,
    "mocha": true
  },
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "rules": {
    "indent": [
      2, 2, {
        "SwitchCase": 1
      }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-console": 0,
    "no-mixed-spaces-and-tabs": ["error", "smart-tabs"]
  }
};
