const STRIKE = '~';
const ITALIC = '_';
const BOLD = '*';
const CODE = '`';
const PREFORMATTED = '```';
const QUOTE = '>';
const TEXT_TYPE = 'TEXT';

const tokens = {
  STRIKE: STRIKE,
  ITALIC: ITALIC,
  BOLD: BOLD,
  CODE: CODE,
  PREFORMATTED: PREFORMATTED,
  QUOTE: QUOTE
};

function spaceOrNothingCheck(index, text) {
  let end = index - 1;
  return end < 0 || text.charAt(end) === ' ';
}

const delimiters = [
  {
    type: 'PREFORMATTED',
    startToken: PREFORMATTED,
    endToken: PREFORMATTED,
    checkStarts: spaceOrNothingCheck
  },
  {
    type: 'CODE',
    startToken: CODE,
    endToken: CODE,
    checkStarts: spaceOrNothingCheck
  },
  {
    type: 'STRIKE',
    startToken: STRIKE,
    endToken: STRIKE,
    checkStarts() { return true; }
  },
  {
    type: 'ITALIC',
    startToken: ITALIC,
    endToken: ITALIC,
    checkStarts() { return true; }
  },
  {
    type: 'BOLD',
    startToken: BOLD,
    endToken: BOLD,
    checkStarts() { return true; }
  },
  {
    type: 'QUOTE',
    startToken: QUOTE,
    endToken: '\n',
    continious: true,
    checkStarts(index, text) {
      let end = index;
      while (end >= 0) {
        end -= 1;
        const char = text.charAt(end);
        if (char === '\n' || char !== ' ') {
          break;
        }
      }
      return text.substring(end, index).trim() === '';
    }
  }
];

function byDelimeter(text, delim, i) {
  return text.substr(i, delim.startToken.length) === delim.startToken && delim.checkStarts(i, text);
}

class Lexer {
  constructor() {
    this.partText = '';
    this.partStart = null;
    this.partEnd = null;
    this.lexems = [];
  }

  static mapToken(text, index, token) {
    const delimeterLength = token.endToken.length;
    let currentIndex = index;
    while (currentIndex < text.length) {
      if (text.substr(currentIndex, delimeterLength) === token.endToken) {
        break;
      }
      currentIndex += 1;
    }
    return currentIndex - index;
  }

  static getContent(lexem) {
    switch (lexem.type) {
      case 'QUOTE': {
        return lexem.text.split('\n').map(line => line.trim().slice(1)).join('\n');
      }
      case 'TEXT': {
        return lexem.text;
      }
      default: {
        const token = tokens[lexem.type];
        const tokenLength = token.length;
        return lexem.text.trim().slice(tokenLength, lexem.text.length - tokenLength);
      }
    }
  }

  static getPositions(start, text, token) {
    let end = start + token.startToken.length;
    const mapLength = Lexer.mapToken(text, end, token);
    end += mapLength + token.endToken.length;
    return [start, end];
  }

  clearVariables() {
    this.partText = '';
    this.partType = null;
    this.partStart = null;
    this.partEnd = null;
  }

  pushLexem(type, start, end, text, skipEmpty = false) {
    if (skipEmpty && !text) return;
    const lexem = {
      type,
      start,
      end,
      text
    };
    lexem.content = Lexer.getContent(lexem);
    this.lexems.push(lexem);
  }

  accumulatePartialText(type, text, start, end) {
    this.partType = type;
    this.partStart = this.partStart || start;
    this.partEnd = end;
    this.partText += text.substring(start, end);
  }

  trackText(otherText) {
    if (otherText) {
      this.pushLexem(TEXT_TYPE, 0, 0, otherText);
    }
  }

  trackBlock({
    block, start, end, text
  }) {
    if (block.continious) {
      this.accumulatePartialText(block.type, text, start, end);
    } else {
      this.pushLexem(this.partType, this.partStart, this.partEnd, this.partText, true);
      this.pushLexem(block.type, start, end, text.substring(start, end));
      this.clearVariables();
    }
  }

  trackPartText() {
    this.pushLexem(this.partType, this.partStart, this.partEnd, this.partText, true);
  }

  lex(text) {
    let otherText = '';
    for (let i = 0; i < text.length;) {
      const [block] = delimiters.filter(delim => byDelimeter(text, delim, i));
      if (block) {
        const [start, end] = Lexer.getPositions(i, text, block);
        this.trackText(otherText);
        otherText = '';
        this.trackBlock({
          block, start, end, text
        });
        i = end;
      } else {
        this.trackPartText();
        this.clearVariables();
        otherText += text.charAt(i);
        i += 1;
      }
    }
    this.trackText(otherText);
    this.trackPartText();
    this.clearVariables();

    const result = this.lexems.slice();
    this.lexems = [];
    return result;
  }
}

class MdFormatter {
  constructor() {
    this.lexer = new Lexer();
    this.formatters = {
      PREFORMATTED(block) {
        if (block.content) {
          return `<pre class="c-mrkdwn__pre">${block.content}</pre>`;
        }
        return block.text;
      },
      CODE(block) {
        if (block.content && !block.content.match(/\n/)) {
          return `<code class="c-mrkdwn__code">${block.content}</code>`;
        }
        return block.text;
      },
      QUOTE(block) {
        return `<blockquote class="c-mrkdwn__quote">${block.content}</blockquote>`;
      },
      STRIKE(block) {
        return `<s>${block.content}</s>`;
      },
      BOLD(block) {
        return `<b>${block.content}</b>`;
      },
      ITALIC(block) {
        return `<i>${block.content}</i>`;
      },
      TEXT(block) {
        return block.content;
      }
    };
  }

  format(text) {
    const lexems = this.lexer.lex(text);
    return lexems.reduce((formatted, block) => `${formatted}${this.formatters[block.type](block)}`, '');
  }
}

if (typeof window !== 'undefined') {
  window.MdFormatter = MdFormatter;
} else {
  module.exports = MdFormatter;
}
