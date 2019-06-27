const mainSelectors = {
  "Team name place": "and contains(@id, 'team_name')",
  channelSections: (names) => {
    let parts = names.map(name => `(normalize-space(string(.)) = '${name}')`);
    if (parts.length > 1) {
      parts = parts.join(" or ");
      return `//*[contains(@class, 'p-channel_sidebar__channel') and (${parts})]`;
    } else {
      parts = parts[0];
      return `//*[contains(@class, 'p-channel_sidebar__channel') and ${parts}]`;
    }
  },
  "channel_section": "//*[contains(@class, 'p-channel_sidebar__channel')]"
};

const selectors = {
  "fake slack ui": mainSelectors
};

module.exports = selectors;
