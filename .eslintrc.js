module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: "eslint:recommended",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module"
  },
  overrides: [
    {
      files: ["**/*.svelte"],
      processor: "svelte3/svelte3"
    }
  ],
  rules: {
    indent: ["error", "tab"],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"]
  }
};
