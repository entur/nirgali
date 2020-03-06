const functions = require('firebase-functions');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const transformRoles = (roles, claim) =>
  roles
    .map(JSON.parse)
    .filter(({ r: role }) => role === claim)
    .reduce((acc, { o: org }) => {
      acc[org] = true;
      return acc;
    }, {});

exports.auth = function(firebaseAdmin) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());

  const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: functions.config().auth.firebase.auth_jwks_uri
    }),
    issuer: functions.config().auth.firebase.auth_issuer,
    algorithm: 'RS256'
  });

  app.get('/api/auth/firebase', jwtCheck, (req, res) => {
    const { sub: uid, roles } = req.user;

    const additionalClaims = {
      editSX: transformRoles(roles, 'editSX')
    };

    firebaseAdmin
      .auth()
      .createCustomToken(uid, additionalClaims)
      .then(customToken => res.json({ firebaseToken: customToken }))
      .catch(err => {
        console.warn(err);
        res.status(500).send({
          message: 'Something went wrong acquiring a Firebase token.',
          error: err
        });
      });
  });

  return functions.https.onRequest(app);
};
