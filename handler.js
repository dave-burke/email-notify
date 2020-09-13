'use strict';

const aws = require('aws-sdk');
const ses = new aws.SES({region: 'us-east-1'});

const { EMAIL_SENDER, EMAIL_RECIPIENT, PASSPHRASE } = process.env;

function sendEmail(recipient, subject, text) {
  const params = {
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: { Data: text }
      },
      Subject: { Data: subject },
    },
    Source: EMAIL_SENDER,
  };

  return new Promise((resolve, reject) => {
    ses.sendEmail(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports.notify = async event => {
  const { subject, body, passphrase } = event;
  if(passphrase !== PASSPHRASE) {
    console.log(`Bad passphrase. Expected "${PASSPHRASE}" but got "${passphrase}"`);
    return { statusCode: 403 };
  }
  if(!subject || !body) {
    return {
      statusCode: 400,
      body: `Expected { subject, body } but got ${JSON.stringify(event)}`,
    }
  }
  try {
    const emailResult = await sendEmail(EMAIL_RECIPIENT, subject, body);
    return {
      statusCode: 200,
      body: JSON.stringify(emailResult, null, 2),
    };
  } catch(err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err, input: event }, null, 2),
    };
  }
};

