module.exports = {
  "json": function (context) {
    return JSON.stringify(context);
  },
  "if": function (conditional, options) {
    if (conditional) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  "ifeq": function (left, right, options) {
    if (left === right) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
};
