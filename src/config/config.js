const configs = [
  require("./playstation-5"),
  require("./xbox-series-x"),
  require("./rep-fitness"),
  require("./rogue-fitness"),
  // Add your configs here...
];

const globalDefaults = require("./defaults.json");

/**
* Merges site data with local and global defaults.
*
* @param site { 
  url: string - site location
  query: string - DOM query (uses 'querySelector') that is used to determine if an alert should be sent.
  inclusiveQuery: bool - should alert when finding the query, defaults true
  interval: number - time, in milliseconds, between checking the site for the query
  intervalAfterFound: number - after alerting the first time, how long to wait before testing again. Used to throttle notifications.
  options: object - JS DOM options
  notifications: {
    from: string - email sender
    to: string - email receiver
    subject: string - subject line of email
  }
} - site data used to query and alert.
* @param defaults - default values for site properties that will be set for the site object.
* @return site object with defaults set for omitted values
**/
function getSiteWithDefaults(site, defaults) {
  if (defaults) {
    return Object.assign({}, globalDefaults, defaults, site);
  }
  return Object.assign({}, globalDefaults, site);
}

/**
 * @return [site] - an array of site data
 **/
function getSites() {
  return configs.reduce((acc, config) => {
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
