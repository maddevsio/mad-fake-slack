const STRIKE = '~';
const ITALIC = '_';
const BOLD = '*';
const CODE = '`';
const PREFORMATTED = '```';
const QUOTE = '>';
const TEXT_TYPE = 'TEXT';
const PREFORMATTED_TYPE = 'PREFORMATTED';
const CODE_TYPE = 'CODE';
const STRIKE_TYPE = 'STRIKE';
const ITALIC_TYPE = 'ITALIC';
const BOLD_TYPE = 'BOLD';
const QUOTE_TYPE = 'QUOTE';

const tokens = {
  STRIKE: STRIKE,
  ITALIC: ITALIC,
  BOLD: BOLD,
  CODE: CODE,
  PREFORMATTED: PREFORMATTED,
  QUOTE: QUOTE
};

function prevSpaceOrNothingCheck(index, text) {
  let end = index - 1;
  return end < 0 || text.charAt(end) === ' ';
}

function nextSpaceOrNothingCheck(index, text) {
  let end = index + 1;
  return end > text.length - 1 || text.charAt(end) === ' ';
}

function nextSpaceOrEndOfStringOrNothingCheck(index, text) {
  let end = index + 1;
  return end > text.length - 1 || text.charAt(end).match(/^(\s|\n|\r\n)$/);
}

function nextNotSpaceOrNothingCheck(index, text) {
  let end = index;
  return end <= text.length - 1 && text.charAt(end) !== ' ';
}

const delimiters = [
  {
    type: PREFORMATTED_TYPE,
    startToken: PREFORMATTED,
    endToken: PREFORMATTED,
    uselastEndToken: true,
    checkStarts: prevSpaceOrNothingCheck,
    checkEnds: nextSpaceOrEndOfStringOrNothingCheck
  },
  {
    type: CODE_TYPE,
    startToken: CODE,
    endToken: CODE,
    checkStarts: prevSpaceOrNothingCheck,
    checkEnds() { return true; }
  },
  {
    type: STRIKE_TYPE,
    startToken: STRIKE,
    endToken: STRIKE,
    checkStarts() { return true; },
    checkEnds() { return true; }
  },
  {
    type: ITALIC_TYPE,
    startToken: ITALIC,
    endToken: ITALIC,
    checkStarts: prevSpaceOrNothingCheck,
    checkEnds() { return true; }
  },
  {
    type: BOLD_TYPE,
    startToken: BOLD,
    endToken: BOLD,
    checkStarts(index, text) {
      return prevSpaceOrNothingCheck(index, text)
             && nextNotSpaceOrNothingCheck(index + BOLD.length, text);
    },
    checkEnds: nextSpaceOrNothingCheck
  },
  {
    type: QUOTE_TYPE,
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
    },
    checkEnds() { return true; }
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
    let content = '';
    let lastEndIndex;
    while (currentIndex < text.length) {
      const textPart = text.substr(currentIndex, delimeterLength);
      if (textPart === token.endToken) {
        if (token.uselastEndToken) {
          lastEndIndex = currentIndex;
        } else {
          break;
        }
      } else if (token.uselastEndToken && lastEndIndex !== undefined) {
        currentIndex = lastEndIndex;
        break;
      }
      content += textPart;
      currentIndex += 1;
    }
    return [content.trim() === '', currentIndex - index];
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
    const [hasEmptyContent, mapLength] = Lexer.mapToken(text, end, token);
    end += mapLength + token.endToken.length;
    return [start, end, hasEmptyContent];
  }

  clearPartialTextVariables() {
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
      this.clearPartialTextVariables();
    }
  }

  trackPartText() {
    this.pushLexem(this.partType, this.partStart, this.partEnd, this.partText, true);
  }

  trackContinuousTextParts() {
    this.trackPartText();
    this.clearPartialTextVariables();
  }

  lex(text) {
    let otherText = '';
    for (let i = 0; i < text.length;) {
      const [block] = delimiters.filter(delim => byDelimeter(text, delim, i));
      if (block) {
        const [start, end, hasEmptyContent] = Lexer.getPositions(i, text, block);
        this.trackText(otherText);
        otherText = '';
        if (!hasEmptyContent && block.checkEnds(end - 1, text)) {
          this.trackBlock({
            block, start, end, text
          });
          i = end;
        } else {
          this.trackContinuousTextParts();
          otherText += text.charAt(i);
          i += 1;
        }
      } else {
        this.trackContinuousTextParts();
        otherText += text.charAt(i);
        i += 1;
      }
    }
    this.trackText(otherText);
    this.trackContinuousTextParts();

    const result = this.lexems.slice();
    this.lexems = [];
    return result;
  }
}

class MdFormatter {
  constructor() {
    this.lexer = new Lexer();
    const SpaceReplacePattern = '&nbsp;<wbr>';
    this.formatters = {
      PREFORMATTED(block) {
        if (block.content.trim()) {
          return `<pre class="c-mrkdwn__pre">${block.content.replace(/(\n|\r\n)$/g, '')}</pre>`;
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
        return `<blockquote class="c-mrkdwn__quote">${block.content.replace(/ /g, SpaceReplacePattern)}</blockquote>`;
      },
      STRIKE(block) {
        return `<s>${block.content.replace(/ /g, SpaceReplacePattern)}</s>`;
      },
      BOLD(block) {
        if (block.content.trim()) {
          return `<b>${block.content}</b>`;
        }
        return block.text;
      },
      ITALIC(block) {
        if (block.content.trim()) {
          return `<i>${block.content.replace(/ /g, SpaceReplacePattern)}</i>`;
        }
        return block.text;
      },
      TEXT(block) {
        return block.content;
      }
    };
  }

  applyFormatting(prevBlock, currBlock) {
    let currBlockFormatted = this.formatters[currBlock.type](currBlock);
    if (prevBlock !== undefined) {
      if (prevBlock.type === PREFORMATTED_TYPE && currBlock.type === TEXT_TYPE) {
        return currBlockFormatted.replace(/^(\n|\r\n)/g, '');
      }
    }
    return currBlockFormatted;
  }

  format(text) {
    const lexems = this.lexer.lex(text);
    let prevBlock;
    return lexems.reduce((formatted, block) => {
      const result = `${formatted}${this.applyFormatting(prevBlock, block)}`;
      prevBlock = block;
      return result;
    }, '');
  }
}

if (typeof window !== 'undefined') {
  window.MdFormatter = MdFormatter;
} else {
  module.exports = MdFormatter;
}
