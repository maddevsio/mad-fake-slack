let id = 0;
const isServer = typeof module !== 'undefined';
let moment;

if (isServer) {
  // eslint-disable-next-line global-require
  moment = require('moment');
} else {
  moment = window.moment;
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
    return `${Math.round(+new Date() / 1000)}.${String(id).padStart(6, '0')}`;
  },
  toHumanTime(timestamp) {
    const unixts = +timestamp.split('.')[0];
    return moment.unix(unixts).format('h:mm A');
  }
};

if (isServer) {
  module.exports = helpers;
} else if (typeof window.Handlebars !== 'undefined') {
  Object.entries(helpers).forEach(([name, fn]) => window.Handlebars.registerHelper(name, fn));
}
