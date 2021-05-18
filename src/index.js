require('dotenv').config()
const finder = require('./finder.js')
const config = require('./config/config.js')
const logger = require('./logger')

async function main() {
  logger.info('🤖 Started Alertbot!')
  await finder.init()
  config.getSites().forEach((site) => {
    finder.initializeIntervalToWatchSite(site)
  })
}

main()
