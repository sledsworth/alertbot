const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const logger = require("./logger.js");
const { delay, setIntervalFor } = require("./utilities");

async function getQueryElementFromURL(query, url, options) {
  let dom;
  try {
    dom = await JSDOM.fromURL(url, options);
  } catch (e) {
    logger.error(`JSDOM.fromURL failed with error: ${e}`);
    return;
  }

  // Wait some time before attempting to query the page in case there
  // are additional scripts needed to run before site is completely rendered.
  // This is an arbitrary length of 10 seconds and doesn't guarantee the site is done loading.
  await delay(10000);

  const element = dom.window.document.body.querySelector(query);
  logger.silly(
    `Queried (${query}) page ${dom.document.title} (${url}) and found:  ${element}`
  );
  return element;
}

async function hasMetCriteriaOfQueryAndInclusion(site, options) {
  const element = await getQueryElementFromURL(site.query, site.url, options);
  return site.inclusiveQuery ? !!element : !element;
}

async function callFuncIfCriteriaMet(site, options, func) {
  const hasMetCriteria = await hasMetCriteriaOfQueryAndInclusion(site, options);
  if (hasMetCriteria) {
    func();
  }
  return hasMetCriteria;
}

async function scheduleCriteriaCheckForSite(site, func) {
  setIntervalFor(site.url, site.interval, () => {
    const hasCriteriaMet = await callFuncIfCriteriaMet(site, site.options);
    
  });
}

module.exports = {
  hasMetCriteriaOfQueryAndInclusion,
};
