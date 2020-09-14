const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const config = require('./config.json')

async function fetchPage(url, options = {}) {
	const dom = await JSDOM.fromURL(url, options);
	console.log(dom.window.document.body.querySelector('button[title="Add to Cart"]'), `-> ${url}`);
	return dom;
}

config.sites.forEach((site) => {
	setInterval(() => {
		fetchPage(site.url, site.options || config.options);
	}, site.interval || config.default.interval);
});