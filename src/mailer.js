const nodemailer = require('nodemailer')
const logger = require('./logger.js')

if (
  !process.env.EMAIL_HOST ||
  !process.env.EMAIL_PASSWORD ||
  !process.env.EMAIL_ADDRESS
) {
  throw new Error(
    '❌ Missing email credentials for notifying a find. Setup a .env file at the root with fields EMAIL_ADDRESS, EMAIL_PASSWORD, and EMAIL_HOST.'
  )
}

/**
 * Send email given the details and notification information.
 *
 * @param details { 
   subject: string, 
   html: string, 
   text: string, 
   notifications: { 
     from: string, 
     to: string, 
     subject: string 
   }}
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
  })
  let info

  try {
    info = await transporter.sendMail({
      from: details.notifications.from,
      to: details.notifications.to,
      subject: details.subject || details.notifications.subject,
      text: details.text,
      html: details.html,
    })
  } catch (e) {
    logger.error(`❌ Node Mailer failed to send email with error: ${e}`)
    return
  }

  logger.info(`📬 Message sent: ${info.messageId}`)
}

/**
 * Helper to format an email on a query found for a site.
 * @param title: string - title of the site
 * @param url: string - site address
 * @param query: string - query used to find the element
 * @param notificationDetails: {
    from: string - email from field
    to: string - who to email message to
    subject: string - subject field of email 
  }
**/
function sendMailFromSiteQuery(title, url, notificationDetails) {
  sendMail({
    text: `
      📬 ${title}
  
      🔗 ${url}
    `,
    notifications: notificationDetails,
  })
}

module.exports = {
  sendMailFromSiteQuery,
}
