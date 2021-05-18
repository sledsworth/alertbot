const puppeteer = require('puppeteer')
const logger = require('./logger.js')
const mailer = require('./mailer.js')
const { updateIntervalFor } = require('./utilities')

let browser

async function init() {
  browser = await puppeteer.launch()
  logger.info('🕵️‍♀️ Finder initialized, searching for items...')
}

/**
 * Sets up interval to check for a query on a site and alert the user. Entry point for finder.
 *
 * @param site: {site} - the site details used to fetch the dom and query to determine if we need to alert.
 * @param interval: number - the interval to poll the site at.
 **/
function initializeIntervalToWatchSite(site, interval = site.interval) {
  updateIntervalFor(site.url, interval, () => {
    fetchSiteAndNotifyIfFound(site, interval)
  })
}

async function sendAlert(page, notifications) {
  const title = await page.title()
  logger.info(`✅ Found ${title} on ${page.url()}!`)
  mailer.sendMailFromSiteQuery(title, page.url(), notifications)
}

async function fetchSiteAndNotifyIfFound(site) {
  logger.silly(`Fetching site: ${site.url}`)
  const page = await browser.newPage()
  try {
    const response = await page.goto(site.url)
    logger.warn(response)
  } catch (e) {
    logger.warn(`⚠️ Failed to go to webpage ${site.url}. ${e}`)
  }

  try {
    const item = await page.waitForSelector(site.query, site.options)
    logger.info(item)
    if (item && site.inclusiveQuery) {
      logger.info(
        `✅ Found selector query (${site.query}) on site (${site.url})!`
      )
      await sendAlert(page, site.notifications)
    } else {
      logger.info(
        `❌ Found selector query (${site.query}) on site (${site.url}), we want this to be excluded.`
      )
    }
  } catch (error) {
    if (!site.inclusiveQuery) {
      logger.info(
        `✅ Did not find selector query (${site.query}) on site (${site.url})!`
      )
      await sendAlert(page, site.notifications)
    } else {
      logger.info(
        `❌ Did not find selector query (${site.query}) on site (${site.url}), we want this to be included.`
      )
    }
  }
  await page.close()
}

module.exports = {
  init,
  initializeIntervalToWatchSite,
}
