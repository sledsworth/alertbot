require("dotenv").config();
const config = require("./items/config.json");
const finder = require("./finder.js");
console.log(process.pid);
config.sites.forEach((site) => {
  console.log(site);
  const siteWithDefaults = Object.assign({}, config.default, site);
  finder.watchForItemOnSite(siteWithDefaults);
});
