module.exports = {
  CustomJSONSchemaValidator(Validator) {
    /* eslint-disable no-param-reassign */
    Validator.prototype.customFormats.uuid = function uuid(input) {
      const v4uuid = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
      return !!String(input).match(v4uuid);
    };

    Validator.prototype.customFormats.slackts = function slackts(input) {
      return !!String(input).match(/^([0-9]{10})\.([0-9]{6})$/);
    };

    Validator.prototype.customFormats.slackchid = function slackchid(input) {
      return !!String(input).match(/^C[0-9A-Z]{8}$/);
    };

    Validator.prototype.customFormats.slackuid = function slackuid(input) {
      return !!String(input).match(/^(U|W)[0-9A-Z]{8}$/);
    };

    Validator.prototype.customFormats.slacktid = function slacktid(input) {
      return !!String(input).match(/^T[0-9A-Z]{8}$/);
    };

    Validator.prototype.customFormats.slackmtypes = function slackmtypes(input) {
      return ['message', 'user_typing'].includes(String(input));
    };
    /* eslint-enable no-param-reassign */
    return Validator;
  }
};
