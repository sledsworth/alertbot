require('dotenv').config();
const nodemailer = require('nodemailer');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = require('./config.json');

let intervals = {};

async function fetchPage(site) {
	let dom;
	try {
		dom = await JSDOM.fromURL(site.url, site.options || config.default.options);
	} catch (e) {
		console.log('JSDOM.fromURL: ', e);
		return;
	}
	setTimeout(() => {
		const query = site.query || config.default.query;
		const inclusive = site.inclusiveQuery || config.default.inclusiveQuery;
		const element = dom.window.document.body.querySelector(query);
		const evaluatedFind = inclusive ? !!element : !element;
		console.log(dom.window.document.body, element, evaluatedFind);
		if (evaluatedFind) {
			notifyOfFind({
				text: `
	${dom.window.document.title}
	
	${site.url}
	
	
	${element ? element.outerHTML : query} found!
				`,
			});
			console.log(site.intervalAfterEmail || config.default.intervalAfterEmail);
			setPageCheckInterval(site, site.intervalAfterEmail || config.default.intervalAfterEmail);
		}
	}, 10000);
}

async function notifyOfFind(details) {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: process.env.EMAIL_ADDRESS, // generated ethereal user
			pass: process.env.EMAIL_PASSWORD, // generated ethereal password
		},
	});

	let info;
	try {
		// send mail with defined transport object
		info = await transporter.sendMail({
			from: config.notifications.from, // sender address
			to: config.notifications.to, // list of receivers
			subject: details.subject || config.notifications.subject, // Subject line
			text: details.text, // plain text body
			html: details.html, // html body
		});
	} catch (e) {
		console.log('nodemailer: ', e);
		return;
	}

	console.log('Message sent: %s', info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

function setPageCheckInterval(site, interval = site.interval || config.default.interval) {
	const intervalTimer = setInterval(() => {
		fetchPage(site);
	}, interval);
	if (intervals[site.url]) {
		console.log(intervals[site.url]);
		clearInterval(intervals[site.url]);
	}
	intervals[site.url] = intervalTimer;
}

if (!process.env.EMAIL_HOST
	|| !process.env.EMAIL_PASSWORD
	|| !process.env.EMAIL_ADDRESS) {
	
	throw new Error("Missing email credentials for notifying a find. Setup a .env file at the root with fields EMAIL_ADDRESS, EMAIL_PASSWORD, and EMAIL_HOST.");
}

config.sites.forEach(site => {
	setPageCheckInterval(site);
});
