let id = 0;
const isServer = typeof module !== 'undefined';
let moment;
let Handlebars;

if (isServer) {
  /* eslint-disable global-require */
  moment = require('moment');
  Handlebars = require('handlebars');
  /* eslint-enable global-require */
} else {
  moment = window.moment;
  Handlebars = window.Handlebars;
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
  breaklines(text) {
    let message = Handlebars.Utils.escapeExpression(text.trim());
    message = message.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(message);
  }
};

if (isServer) {
  module.exports = helpers;
} else if (typeof window.Handlebars !== 'undefined') {
  Object.entries(helpers).forEach(([name, fn]) => window.Handlebars.registerHelper(name, fn));
}
