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

const delimiters = [
  {
    type: PREFORMATTED_TYPE,
    startToken: PREFORMATTED,
    endToken: PREFORMATTED,
    useLastEndToken: true,
    checkStarts(index, text) {
      let end = index - 1;
      return index === 0 || end < 0 || text.charAt(end).match(/ |\n|\r\n/);
    },
    checkEnds(index, text) {
      let end = index + PREFORMATTED.length;
      return index > text.length - 1 || text.charAt(end) !== '`';
    },
    isValidContent() { return true; }
  },
  {
    type: CODE_TYPE,
    startToken: CODE,
    endToken: CODE,
    checkStarts(index, text) {
      let end = index - CODE.length;
      return end < 0 || text.charAt(end) !== '`';
    },
    checkEnds(index, text) {
      let end = index + CODE.length;
      return index > text.length - 1 || text.charAt(end) !== '`';
    },
    isValidContent(content) {
      return content.trim() !== '' && content.trim() !== '`' && !content.match(/^`/g);
    }
  },
  {
    type: STRIKE_TYPE,
    startToken: STRIKE,
    endToken: STRIKE,
    checkStarts(index, text) {
      let end = index - 1;
      return end < 0 || (!text.charAt(end).match(/[~*_`]|\n/) && text.charAt(end) === ' ');
    },
    checkEnds(index, text) {
      let end = index + 1;
      return end >= text.length || (text.charAt(index) === '~' && text.charAt(end).match(/ |\n|\r\n/));
    },
    isValidContent(content) {
      return !content.match(/~|( $)|(~$)/g) && content.trim() !== '';
    }
  },
  {
    type: ITALIC_TYPE,
    startToken: ITALIC,
    endToken: ITALIC,
    checkStarts(index, text) {
      let end = index - 1;
      return end < 0 || !text.charAt(end).match(/[~*_`]|\n/);
    },
    checkEnds(index, text) {
      let end = index + 1;
      return end >= text.length || (text.charAt(index) === '_' && text.charAt(end).match(/ |\n|\r\n/));
    },
    isValidContent(content) {
      return content.trim() !== '' && !content.match(/(^_)|(__)|(_$)/g);
    }
  },
  {
    type: BOLD_TYPE,
    startToken: BOLD,
    endToken: BOLD,
    checkStarts(index, text) {
      let end = index - 1;
      return end < 0 || (!text.charAt(end).match(/[~*_`]|\n/) && text.charAt(end) === ' ');
    },
    checkEnds(index, text) {
      let end = index + 1;
      return end >= text.length || (text.charAt(index) === '*' && text.charAt(end).match(/ |\n|\r\n/));
    },
    isValidContent(content) {
      return !content.match(/\*|( $)|(\*$)/g) && content.trim() !== '';
    }
  },
  {
    type: QUOTE_TYPE,
    startToken: QUOTE,
    endToken: '\n',
    continious: true,
    isValidContent() { return true; },
    checkStarts(index, text) {
      let end = index;
      if (index > 0) {
        while (end >= 0) {
          end -= 1;
          const char = text.charAt(end);
          if (char === '\n' || char !== ' ') {
            break;
          }
        }
      }
      return text.substring(end, index).trim() === '';
    },
    checkEnds(index, text) {
      let end = index + 1;
      return end >= text.length || (text.charAt(index) === '\n' && text.charAt(end) !== '>');
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

  static endsWithToken({
    block, start, end, text
  }) {
    return text.substring(start, end).endsWith(block.endToken);
  }

  static mapToken(text, index, token) {
    const delimeterLength = token.endToken.length;
    let currentIndex = index;
    let content = '';
    let validContent = false;
    while (currentIndex < text.length) {
      const textPart = text.substr(currentIndex, delimeterLength);
      validContent = token.isValidContent(content);
      if (textPart === token.endToken
          && token.checkEnds(currentIndex, text)
          && validContent) {
        break;
      }
      content += textPart;
      currentIndex += 1;
    }
    return [validContent, currentIndex - index];
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
    const [isValidContent, mapLength] = Lexer.mapToken(text, end, token);
    end += mapLength + token.endToken.length;
    return [start, end, isValidContent];
  }

  pushLexem(type, start, end, text) {
    if (!text) return;
    const lexem = {
      type,
      start,
      end,
      text
    };
    lexem.content = Lexer.getContent(lexem);
    this.lexems.push(lexem);
  }

  trackText(otherText) {
    if (otherText) {
      this.pushLexem(TEXT_TYPE, 0, 0, otherText);
    }
  }

  trackBlock({
    block, start, end, text
  }) {
    this.pushLexem(block.type, start, end, text.substring(start, end));
  }

  lex(text) {
    let otherText = '';
    for (let i = 0; i < text.length;) {
      const [block] = delimiters.filter(delim => byDelimeter(text, delim, i));
      if (block) {
        const [start, end, isValidContent] = Lexer.getPositions(i, text, block);
        this.trackText(otherText);
        otherText = '';
        const checkOptions = {
          block, start, end, text
        };
        if (!isValidContent || (!block.continious && !Lexer.endsWithToken(checkOptions))) {
          otherText += text.charAt(i);
          i += 1;
        } else {
          this.trackBlock({
            block, start, end, text
          });
          i = end;
        }
      } else {
        otherText += text.charAt(i);
        i += 1;
      }
    }
    this.trackText(otherText);

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
        if (block.content.trim()) {
          return `<pre class="c-mrkdwn__pre">${block.content.replace(/^(\n|\r\n)|(\n|\r\n)$/g, '')}</pre>`;
        }
        return block.text;
      },
      CODE(block) {
        return MdFormatter.formatBlockWithoutBreakLine(block,
          b => `<code class="c-mrkdwn__code">${b.content}</code>`);
      },
      QUOTE(block) {
        return `<blockquote class="c-mrkdwn__quote">${MdFormatter.replaceSpaces(block.content)}</blockquote>`;
      },
      STRIKE(block) {
        return MdFormatter.formatBlockWithoutBreakLine(block,
          b => `<s>${MdFormatter.replaceSpaces(b.content)}</s>`);
      },
      BOLD(block) {
        return MdFormatter.formatBlockWithoutBreakLine(block,
          b => `<b>${MdFormatter.replaceSpaces(b.content)}</b>`);
      },
      ITALIC(block) {
        return MdFormatter.formatBlockWithoutBreakLine(block,
          b => `<i>${MdFormatter.replaceSpaces(b.content)}</i>`);
      },
      TEXT(block) {
        return MdFormatter.replaceSpaces(block.content);
      }
    };
  }

  static formatBlockWithoutBreakLine(block, replaceTo = () => {}) {
    if (block.content.trim()) {
      return block.content.match(/\n/g) ? MdFormatter.replaceSpaces(block.text) : replaceTo(block);
    }
    return MdFormatter.replaceSpaces(block.text);
  }

  static replaceSpaces(text) {
    const SpaceReplacePattern = '&nbsp;<wbr>';
    const fixMultipleSpacesIn = t => t.match(/  +/) ? t.replace(/ /g, SpaceReplacePattern) : t;
    return text !== ' ' ? fixMultipleSpacesIn(text) : text;
  }

  applyFormatting(prevBlock, currBlock) {
    let currBlockFormatted = this.formatters[currBlock.type](currBlock);
    const prevBlockEmpty = prevBlock && prevBlock.text.match(/^( +)$/g);
    const prevBlockIsText = prevBlock && prevBlock.type === TEXT_TYPE;
    const prevBlockIsPreformatted = prevBlock && prevBlock.type === PREFORMATTED_TYPE;
    const currBlockIsText = currBlock && currBlock.type === TEXT_TYPE;
    const isCurrentBlockQuote = currBlock.type === QUOTE_TYPE;
    if (prevBlockIsPreformatted && currBlockIsText) {
      return currBlockFormatted.replace(/^(\n|\r\n)/g, '');
    }
    if (prevBlockIsText && prevBlockEmpty && isCurrentBlockQuote) {
      return MdFormatter.replaceSpaces(currBlock.text);
    }
    return currBlockFormatted;
  }

  format(text) {
    const lexems = this.lexer.lex(text);
    let prevBlock;
    return lexems.reduce((formatted, block, index) => {
      const result = `${formatted}${this.applyFormatting(prevBlock, block, lexems[index + 1])}`;
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
