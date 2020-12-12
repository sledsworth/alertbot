const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const logger = require("./logger.js");
const { delay, updateIntervalFor } = require("./utilities");

async function getQueryElementFromURL(query, url, options) {
  let dom;
  try {
    dom = await JSDOM.fromURL(url, options);
  } catch (e) {
    logger.error(`JSDOM.fromURL failed with error: ${e}`);
    return;
  }
  console.log("before delay");
  // Wait some time before attempting to query the page in case there
  // are additional scripts needed to run before site is completely rendered.
  // This is an arbitrary length of 10 seconds and doesn't guarantee the site is done loading.
  await delay(10000);
  console.log("after delay");

  const element = dom.window.document.body.querySelector(query);
  logger.silly(
    `Queried (${query}) page ${dom.window.document.title} (${url}) and found:  ${element}`
  );
  return element;
}

async function hasMetCriteriaOfQueryAndInclusion(site, options) {
  const element = await getQueryElementFromURL(site.query, site.url, options);
  return site.inclusiveQuery ? !!element : !element;
}

async function resetWatchForItemOnFind(site) {
  const hasMetCriteria = await hasMetCriteriaOfQueryAndInclusion(
    site,
    site.options
  );
  logger.info(hasMetCriteria);
  if (hasMetCriteria) {
    watchForItemOnSite(site.url, site.intervalAfterFound);
  }
}

function watchForItemOnSite(site, interval = site.interval) {
  updateIntervalFor(site.url, interval, () => {
    resetWatchForItemOnFind(site, interval);
  });
}

module.exports = {
  hasMetCriteriaOfQueryAndInclusion,
  watchForItemOnSite,
};
