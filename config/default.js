function isPresent(variable) {
  return typeof variable !== 'undefined' && variable !== null && variable !== '';
}

module.exports = function configure() {
  if (!isPresent(process.env.PORT)) {
    process.env.PORT = 9001;
  }
  if (!isPresent(process.env.HOST)) {
    process.env.HOST = '0.0.0.0';
  }
  if (!isPresent(process.env.DEFAULT_HEADER_HIDE_TIME_INTERVAL_IN_MIN)) {
    process.env.DEFAULT_HEADER_HIDE_TIME_INTERVAL_IN_MIN = 5;
  }
  if (!isPresent(process.env.MESSAGES_MAX_COUNT)) {
    process.env.MESSAGES_MAX_COUNT = 100;
  }
  if (!isPresent(process.env.MAIN_PAGE)) {
    process.env.MAIN_PAGE = 'slackv2';
  }
};
