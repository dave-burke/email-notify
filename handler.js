'use strict';

const aws = require('aws-sdk');
const ses = new aws.SES({region: 'us-east-1'});

const { EMAIL_SENDER, EMAIL_RECIPIENT } = process.env;

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
  try {
    const emailResult = await sendEmail(EMAIL_RECIPIENT, 'Test subject', 'Test body');
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
