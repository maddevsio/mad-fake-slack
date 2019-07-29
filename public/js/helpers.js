let id = 0;
const isServer = typeof module !== 'undefined';
let moment;
let Handlebars;
let Formatter;

if (isServer) {
  /* eslint-disable global-require */
  moment = require('moment');
  Handlebars = require('handlebars');
  Formatter = require('./formatters');
  /* eslint-enable global-require */
} else {
  moment = window.moment;
  Handlebars = window.Handlebars;
  Formatter = window.MdFormatter;
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  return false;
}

const escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeChar(chr) {
  return escape[chr];
}

function escapeExpression(string, possible = /[&<>"'=]/) {
  const badChars = new RegExp(possible, 'g');
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } if (string == null) {
      return '';
    } if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    // eslint-disable-next-line no-param-reassign
    string = '' + string;
  }

  if (!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}


const helpers = {
  json(context) {
    return JSON.stringify(context);
  },
  concat(...args) {
    return args.slice(0, -1).join('');
  },
  eq(v1, v2) {
    return v1 === v2;
  },
  ne(v1, v2) {
    return v1 !== v2;
  },
  lt(v1, v2) {
    return v1 < v2;
  },
  gt(v1, v2) {
    return v1 > v2;
  },
  lte(v1, v2) {
    return v1 <= v2;
  },
  gte(v1, v2) {
    return v1 >= v2;
  },
  and() {
    return Array.prototype.slice.call(arguments).every(Boolean);
  },
  or() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  },
  makeTs() {
    id += 1;
    return helpers.createTs(id);
  },
  createTs(incrementId) {
    return `${Math.round(+new Date() / 1000)}.${String(incrementId).padStart(6, '0')}`;
  },
  toHumanTime(timestamp) {
    const unixts = +timestamp.split('.')[0];
    return moment.unix(unixts).format('h:mm A');
  },
  inlineIf(conditional, trueOption, elseOption) {
    let ifCondition = conditional;
    if (typeof ifCondition === 'function') {
      ifCondition = ifCondition.call(this);
    }
    if (!conditional || isEmpty(conditional)) {
      return elseOption;
    }
    return trueOption;
  },
  formatMessage(text) {
    let message = escapeExpression(text.trim());
    const formatter = new Formatter();
    message = formatter.format(message).replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(message);
  }
};

if (isServer) {
  module.exports = helpers;
} else if (typeof window.Handlebars !== 'undefined') {
  Object.entries(helpers).forEach(([name, fn]) => window.Handlebars.registerHelper(name, fn));
}
