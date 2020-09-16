require('dotenv').config();
const nodemailer = require("nodemailer");
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const config = require('./config.json');

async function fetchPage(url, query = config.default.query, options = config.options) {
	const dom = await JSDOM.fromURL(url, options);
	const element = dom.window.document.body.querySelector(query);
	if (element) {
		notifyOfFind({
			text: 
			`
${dom.window.document.title}

${url}


${element.outerHTML} found!
			`,
		});
		return true;
	}
	return false;
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
	} catch(e) {
		console.log(e);
		return;
	}

	console.log('Message sent: %s', info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

config.sites.forEach(site => {
	setInterval(() => {
		fetchPage(site.url, site.query, site.options);
	}, site.interval || config.default.interval);
});
