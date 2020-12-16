const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const logger = require("./logger.js");
const mailer = require("./mailer.js");
const { delay, updateIntervalFor } = require("./utilities");

/**
 * Get the DOM of the site at requested url.
 *
 * @param url: string - the URL of the site we want the DOM of
 * @param options: {JSDOM Options: https://github.com/jsdom/jsdom#basic-options} - helpful to set allowance of external scripts *   and resources.
 * @param delayFor: number - amount of time to wait before returning the DOM. This is fairly arbitrary, but in cases where we
 *   request external scripts be loaded, we want to allow enough time for the site to completely render before querying.
 *
 * @return JSDOM - DOM of the site at URL
 **/
async function getDomFromURLWithOptions(url, options, delayFor = 10000) {
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
  await delay(delayFor);

  return dom;
}

/**
 * Get the element from the dom given a query.
 *
 * @param dom: JSDOM - DOM of the site at URL (https://github.com/jsdom/jsdom)
 * @param query: string - query to be used in `querySelector` to find the element
 *
 * @return element: HTMLElement - the element found by the query
 **/
function getQueryElementFromURL(dom, query) {
  if (!dom.window) {
    logger.error(`DOM not found for ${url}`);
    return;
  }
  const element = dom.window.document.body.querySelector(query);
  if (element) {
    logger.silly(
      `Queried (${query}) on page ${dom.window.document.title} and found:  ${element}`
    );
  } else {
    logger.silly(
      `Queried (${query}) on page ${dom.window.document.title} and didn't find the element.`
    );
  }
  return element;
}

/**
 * Fetch the dom, query for the element, and determine if we should send an alert. Send alert if criteria has been met.
 *
 * @param site: {site} - the site details used to fetch the dom and query to determine if we need to alert.
 **/
async function checkSiteForQueryAndAlertOnFind(site) {
  const dom = await getDomFromURLWithOptions(
    site.url,
    site.options,
    site.loadDelay
  );
  const element = getQueryElementFromURL(dom, site.query);
  const hasMetCriteriaForAlert = site.inclusiveQuery ? !!element : !element;

  if (hasMetCriteriaForAlert) {
    logger.info(`Found ${site.url}!`);
    mailer.sendMailFromSiteQuery(
      dom.window.document.title,
      site.url,
      site.query,
      site.notifications
    );

    // If we have intervalAfterFound set we need to
    // update the interval at which we poll the site
    if (site.intervalAfterFound) {
      initializeIntervalToWatchSite(site, site.intervalAfterFound);
    }
  }
}

/**
 * Sets up interval to check for a query on a site and alert the user. Entry point for finder.
 *
 * @param site: {site} - the site details used to fetch the dom and query to determine if we need to alert.
 * @param interval: number - the interval to poll the site at.
 **/
function initializeIntervalToWatchSite(site, interval = site.interval) {
  updateIntervalFor(site.url, interval, () => {
    checkSiteForQueryAndAlertOnFind(site, interval);
  });
}

module.exports = {
  initializeIntervalToWatchSite,
};
