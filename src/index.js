require("dotenv").config();
const finder = require("./finder.js");
const config = require("./items/config.js");

config.getSites().forEach((site) => {
  finder.watchForItemOnSite(site);
});
