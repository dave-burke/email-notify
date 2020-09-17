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

function rejectMissingAuth(event) {
  console.log('Expected "Authorization" header');
  console.log(event.headers);
  // It is standard to return a WWW-Authenticate header, but this service
  // is just for me. I know how to structure the request, so why help
  // anyone who doesn't?
  return {
    statusCode: 404
  };
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
    return rejectMissingAuth(event);
  }

  const [username, passphrase] = parseBasicAuthHeader(event.headers.Authorization);

  if(username !== USERNAME && passphrase !== PASSPHRASE) {
    return failure(403, 'Bad credentials', event);
  }

  if(!event.body) {
    return failure(400, 'Expected a body on the request', event);
  }

  const { subject, body } = JSON.parse(event.body);
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

