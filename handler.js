'use strict';

const aws = require('aws-sdk');
const ses = new aws.SES({region: 'us-east-1'});

const { EMAIL_SENDER, EMAIL_RECIPIENT, USERNAME, PASSPHRASE } = process.env;

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

function Failure(message, event) {
  console.log(message);
  console.log(event);
  // A typical web service would provide more useful and specific errors, but
  // this service is just for me. I know how to structure the request, so why
  // help anyone who doesn't?
  this.statusCode = 404;
}

function parseBasicAuthHeader(rawHeader) {
  // Format is "Basic [base64 encoded 'username:password']"
  const encodedToken = rawHeader.substring(6);
  // Node does not implement `btoa()`
  const decodedToken = Buffer.from(encodedToken, 'base64').toString();
  const credentials = decodedToken.split(':'); // [username, password]
  return credentials;
}

module.exports.notify = async event => {
  if(!event.headers || !event.headers.Authorization) {
    return new Failure('Expected "Authorization" header', event);
  }

  const [username, passphrase] = parseBasicAuthHeader(event.headers.Authorization);

  if(username !== USERNAME && passphrase !== PASSPHRASE) {
    return new Failure('Bad credentials', event);
  }

  if(!event.body) {
    return new Failure('Expected a body on the request', event);
  }

  const { subject, body } = JSON.parse(event.body);
  if(!subject || !body) {
    return new Failure('Expected { subject, body } on the request', event);
  }
  try {
    const emailResult = await sendEmail(EMAIL_RECIPIENT, subject, body);
    return {
      statusCode: 200,
      body: JSON.stringify(emailResult, null, 2),
    };
  } catch(err) {
    return new Failure(err, event);
  }
};

