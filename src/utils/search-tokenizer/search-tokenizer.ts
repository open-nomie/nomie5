/**
 * Primarily based on Kessler/tokenize https://github.com/kessler/tokenize/blob/master/index.js
 * The MIT License (MIT)

Copyright (c) 2019 Yaniv Kessler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

// character tokens
const TOKEN_CHARS = ["(", ")", ",", "[", "]"];
const GLOBBING_CHARS = ['"', "'"];
const SEPARATORS = [" "];

/**
 *	 	go through some text and turn it into tokens, based on provided or default rules
 *
 *	 	TODO: add examples and defaults, especially to rules.something, add line breaks
 *
 *    @param  {String} text - the text to tokenize
 *    @param  {Object} [rules] - tokenization rules
 *    @param {String[]} rules.tokenChars - an array specifying tokens that are made of single characters. These effectively create token boundaries but are also considered tokens
 *    @param {String[]} rules.globbingChars - globbing characters will cause the tokenizer to consider everything after an occurrence of the globbing char as part of a single token, until it hits the globbing character again.
 *    @param {String[]} rules.separators - separators are characters that represent token boundary but are not tokens themselves
 *    @return {Token[]} returns an array of Token instances
 */

export interface ITokenizerRules {
  tokenChars: Array<string>;
  globbingChars: Array<string>;
  separators: Array<string>;
}

class Token {
  _content: string;
  constructor(content) {
    this._content = content;
  }
  get content() {
    return this._content;
  }
}

export default (
  text,
  rules: ITokenizerRules = {
    tokenChars: TOKEN_CHARS,
    globbingChars: GLOBBING_CHARS,
    separators: SEPARATORS,
  }
) => {
  // state:
  let tokens: Array<Token> = [];
  let currentToken = "";
  let globbingChar = undefined;

  for (let i = 0; i < text.length; i++) {
    let char = text[i];

    if (isGlobbingMode()) {
      if (isSameGlobbingChar(char)) {
        pushToken();
        pushToken(char);
        stopGlobbing();
      } else {
        currentToken += char;
      }

      continue;
    }

    if (isTokenStart() && isGlobbingChar(char)) {
      pushToken(char);
      startGlobbing(char);
      continue;
    }

    if (isSeparator(char) || isTokenChar(char)) {
      if (hasTokenReady()) {
        pushToken();
      }

      if (isTokenChar(char)) {
        pushToken(char);
      }

      continue;
    }

    currentToken += char;
  }

  if (hasTokenReady()) {
    tokens.push(new Token(currentToken));
  }

  function pushToken(char = currentToken) {
    tokens.push(new Token(char));
    currentToken = "";
  }

  function isSeparator(char) {
    return rules.separators.includes(char);
  }

  function hasTokenReady() {
    return currentToken !== "";
  }

  function isTokenChar(char) {
    return rules.tokenChars.includes(char);
  }

  function isTokenStart() {
    return currentToken === "";
  }

  function isGlobbingChar(char) {
    return rules.globbingChars.includes(char);
  }

  function isSameGlobbingChar(char) {
    return globbingChar === char;
  }

  function isGlobbingMode() {
    return globbingChar !== undefined;
  }

  function startGlobbing(char) {
    globbingChar = char;
  }

  function stopGlobbing() {
    globbingChar = undefined;
  }

  return tokens;
};
