# Alertbot

Parse web pages and send alerts when criteria is met.

## Usage

### Install

Install dependencies with `npm install`.

### Configure Sites & Alerts

The main configuration you will have to set is inside `/src/config`. Generally, I add a new configure `json` file for each item or site I am querying based on context. For example, I have multiple items I want to be alerted about from roguefitness.com when they come in stock, so I have a file for that particular site. I also have a config file for playstation 5–an item–because I want to broaden my search to multiple sites.

The general workflow for adding new sites and alerts looks like this:

1. Create a new `json` config file. Check one of the existing ones for format, but it looks something like this:
   ```json
   {
     "defaults": {
       "query": "div.stock.available span.in-stock"
     },
     "sites": [
       {
         "url": "https://www.repfitness.com/bars-plates/storage/bar-and-bumper-plate-tree"
       },
       {
         "url": "https://www.repfitness.com/strength-equipment/strength-training/benches/rep-ab-5000"
       }
     ]
   }
   ```
2. Set your global defaults in `/src/config/defaults.json`. Here is a list of properties you can set:

   | Property       | Description                                                                                                                                                                                                                                                                                                           | Type                    |
   | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
   | query          | DOM query that is used to determine if an alert should be sent.                                                                                                                                                                                                                                                       | `string`                |
   | inclusiveQuery | Should alert when finding the query? Or in the absence of the element? This is useful to set to `false` in cases where you don't know what the 'Add to Cart' button would look like, but you do have an element to query for that wouldn't exist if the item was in stock ('Out of stock' or disabled button, etc.) . | `bool`                  |
   | interval       | Time, in milliseconds, between checking the site for the query                                                                                                                                                                                                                                                        | `number`                |
   | options        | [Puppeteer Page.waitForSelector Options](https://pptr.dev/#?product=Puppeteer&version=v9.1.0&show=api-pagewaitforselectorselector-options). Can be used to set timeouts for searches and other criteria for selectors.                                                                                                |
   | notifications  | Configuration for email notifications                                                                                                                                                                                                                                                                                 | `{ from, to, subject }` |

3. Add the path to the config file you created in `/src/config/config.js`.

4. Finally, to have notifications work, you need to set up a `.env` file with the variables `EMAIL_ADDRESS`, `EMAIL_PASSWORD`, `EMAIL_HOST`. Currently, I'm using [nodemailer](https://nodemailer.com/transports/)'s default SMTP transport setup with a hover.com mailbox. [You can use Gmail](https://nodemailer.com/usage/using-gmail/), but it seems like it could be a pain. If you need to customize anything related to the email notifications, you'll want to look in the `/src/mailer.js` file.

### Start

Now with all the configuration done, you are ready to start your server: `npm run start`

## Troubleshooting

- Logs can be found in `/logs` if you are having trouble with running the application
- The `config` changes are not picked up automatically by the application, you have to restart to see the changes.
