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

function failure(statusCode, bodyContent, logMessage) {
  console.error(logMessage);
  if(!bodyContent) {
    return { statusCode };
  } else if(typeof bodyContent === 'String') {
    return {
      statusCode,
      body: JSON.stringify({
        message: bodyContent,
      }, null, 2),
    }
  } else {
    return {
      statusCode,
      body: JSON.stringify(bodyContent, null, 2),
    }
  }
}

module.exports.notify = async event => {
  if(!event.body) {
    return failure(400, 'Expected a body on the request', event);
  }
  const { subject, body, passphrase } = event.body;
  if(passphrase !== PASSPHRASE) {
    console.log(`Bad passphrase: "${passphrase}"`);
    return failure(403, null, event);
  }
  if(!subject || !body) {
    return failure(400, 'Expected { subject, body } on the request', event);
  }
  try {
    const emailResult = await sendEmail(EMAIL_RECIPIENT, subject, body);
    return {
      statusCode: 200,
      body: JSON.stringify(emailResult, null, 2),
    };
  } catch(err) {
    return failure(500, err, event );
  }
};

