'use strict';

var aws = require('aws-sdk');
var ses = new aws.SES({region: 'us-east-1'});

var { EMAIL_SENDER, EMAIL_RECIPIENT } = process.env;

function sendEmail(recipient, subject, text) {
  var params = {
    Destination: {
      ToAddresses: [recipient]
    },
    Message: {
      Body: {
        Text: { Data: text }
      },
      Subject: { Data: subject }
    },
    Source: EMAIL_SENDER,
  };

  return new Promise((resolve, reject) => {
    ses.sendEmail(params, function (err, data) {
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
    var emailResult = await sendEmail(EMAIL_RECIPIENT, 'Test subject', 'Test body');
  } catch(err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err, null, 2),
    };
  }

  console.log('Success');
  return {
    statusCode: 200,
    body: JSON.stringify(emailResult, null, 2),
  };
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
