class MdFormatter {
  constructor() {
    this.rules = Object.entries(Object.getOwnPropertyDescriptors(MdFormatter))
      .reduce((props, [key]) => props.concat(key.startsWith('rule') ? [key] : []), []);
  }

  static rulePre(text) {
    // eslint-disable-next-line no-useless-escape
    return text.replace(/[`]{3}([^`]+)[`]{3}(?!.*\<\/code\>)/g, '<pre>$1</pre>');
  }

  static ruleCode(text) {
    // eslint-disable-next-line no-useless-escape
    return text.replace(/[`]{1}([^`]+)[`]{1}/g, '<code>$1</code>');
  }

  static ruleBold(text) {
    // eslint-disable-next-line no-useless-escape
    return text.replace(/[\*]{1}([^\*]+)[\*]{1}(?!.*\<\/(pre|code)\>)/g, '<b>$1</b>');
  }

  static ruleItalic(text) {
    // eslint-disable-next-line no-useless-escape
    return text.replace(/[_]{1}([^_]+)[_]{1}(?!.*\<\/(pre|code)\>)/g, '<i>$1</i>');
  }

  static ruleStrike(text) {
    // eslint-disable-next-line no-useless-escape
    return text.replace(/[~]{1}([^~]+)[~]{1}(?!.*\<\/(pre|code)\>)/g, '<s>$1</s>');
  }

  format(text) {
    return this.rules.reduce((formatted, key) => MdFormatter[key](formatted), text);
  }
}

if (typeof window !== 'undefined') {
  window.MdFormatter = MdFormatter;
} else {
  module.exports = MdFormatter;
}
