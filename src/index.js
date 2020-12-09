require("dotenv").config();
const nodemailer = require("nodemailer");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const config = require("../config.json");
const logger = require("./logger.js");
const mailer = require("./mailer.js");

let intervals = {};

async function fetchPage(site) {
  let dom;
  try {
    dom = await JSDOM.fromURL(site.url, site.options || config.default.options);
  } catch (e) {
    logger.error(`JSDOM.fromURL failed with error: ${e}`);
    return;
  }
  setTimeout(() => {
    const query = site.query || config.default.query;
    const inclusive =
      site.inclusiveQuery !== undefined
        ? site.inclusiveQuery
        : config.default.inclusiveQuery;
    const element = dom.window.document.body.querySelector(query);
    const evaluatedFind = inclusive ? !!element : !element;
    logger.silly(
      `Queried page ${dom.document.title} for ${
        element || query
      }, which resulted in ${evaluatedFind}.`
    );
    if (evaluatedFind) {
      mailer.sendMail({
        text: `
			${dom.window.document.title}
	
			${site.url}
	
	
			${element ? element.outerHTML : query} found!
		`,
      });
      setPageCheckInterval(
        site,
        site.intervalAfterEmail || config.default.intervalAfterEmail
      );
    }
  }, 10000);
}

function setPageCheckInterval(
  site,
  interval = site.interval || config.default.interval
) {
  const intervalTimer = setInterval(() => {
    fetchPage(site);
  }, interval);
  if (intervals[site.url]) {
    logger.silly(`Clearing intervals for ${site.url}, ${intervals[site.url]}`);
    clearInterval(intervals[site.url]);
  }
  intervals[site.url] = intervalTimer;
}

if (
  !process.env.EMAIL_HOST ||
  !process.env.EMAIL_PASSWORD ||
  !process.env.EMAIL_ADDRESS
) {
  throw new Error(
    "Missing email credentials for notifying a find. Setup a .env file at the root with fields EMAIL_ADDRESS, EMAIL_PASSWORD, and EMAIL_HOST."
  );
}

config.sites.forEach((site) => {
  setPageCheckInterval(site);
});
