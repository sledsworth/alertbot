const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const logger = require("./logger.js");
const mailer = require("./mailer.js");
const { delay, updateIntervalFor } = require("./utilities");

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

async function getQueryElementFromURL(query, url, options) {
  const dom = await getDomFromURLWithOptions(url, options);
  if (!dom.window) {
    logger.error(`DOM not found for ${url}`);
  }
  const element = dom.window.document.body.querySelector(query);
  logger.silly(
    `Queried (${query}) page ${dom.window.document.title} (${url}) and found:  ${element}`
  );
  return { dom, element };
}

async function hasMetCriteriaOfQueryAndInclusion(site, options) {
  const { element, dom } = await getQueryElementFromURL(
    site.query,
    site.url,
    options
  );
  return { element, dom, found: site.inclusiveQuery ? !!element : !element };
}

async function resetWatchForItemOnFind(site) {
  const { found, dom, element } = await hasMetCriteriaOfQueryAndInclusion(
    site,
    site.options
  );
  if (found) {
    logger.info(`Found ${site.url}!`);
    mailer.sendMail({
      text: `
        ${dom.window.document.title}
    
        ${site.url}
    
    
        ${element ? element.outerHTML : query} found!
      `,
      notifications: site.notifications,
    });

    watchForItemOnSite(site, site.intervalAfterFound);
  }
}

function watchForItemOnSite(site, interval = site.interval) {
  updateIntervalFor(site.url, interval, () => {
    resetWatchForItemOnFind(site, interval);
  });
  const memory = process.memoryUsage();
  logger.debug(memory.rss);
}

module.exports = {
  hasMetCriteriaOfQueryAndInclusion,
  watchForItemOnSite,
};
