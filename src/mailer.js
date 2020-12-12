const nodemailer = require("nodemailer");

const config = require("./items/config.json");
const logger = require("./logger.js");

/**
 *
 * @param details { subject: string, html: string, text: string }
 **/
async function sendMail(details) {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
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
    logger.error(`Node Mailer failed to send email with error: ${e}`);
    return;
  }

  logger.info(`Message sent: ${info.messageId}`);
}

module.exports = {
  sendMail,
};
