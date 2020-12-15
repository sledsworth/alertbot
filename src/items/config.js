const items = [
  require("./playstation-5"),
  require("./xbox-series-x"),
  require("./rep-fitness"),
  require("./rogue-fitness"),
  // Add your configs here...
];

const globalDefault = require("./config.json").defaults;

function getSiteWithDefaults(site, defaults) {
  if (defaults) {
    return Object.assign({}, globalDefault, defaults, site);
  }
  return Object.assign({}, globalDefault, site);
}

function getSites() {
  return items.reduce((acc, config) => {
    if (Array.isArray(config.sites)) {
      return [
        ...acc,
        ...config.sites.map((site) => {
          return getSiteWithDefaults(site, config.defaults);
        }),
      ];
    }
    return acc;
  }, []);
}

module.exports = {
  getSites,
};
