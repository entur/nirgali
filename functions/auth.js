const functions = require('firebase-functions');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getAuth } = require('firebase-admin/auth');

const getAuth0ClaimsNamespace = () => functions.config().auth.firebase.auth0
  .claims_namespace;

const transformRoles = (roles, claim) =>
  roles
    .map(JSON.parse)
    .filter(({ r: role }) => role === claim)
    .reduce((acc, { o: org }) => {
      acc[org] = true;
      return acc;
    }, {});

exports.auth = function() {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());

  const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: functions.config().auth.firebase['auth0'].auth_jwks_uri
    }),
    issuer: functions.config().auth.firebase['auth0'].auth_issuer,
    algorithms: ['RS256']
  });

  const authenticate = (req, res) => {
    const { sub: uid } = req.user;
    const auth0ClaimsNamespace = getAuth0ClaimsNamespace();
    let roles = req.user[auth0ClaimsNamespace];

    const additionalClaims = {
      editSX: transformRoles(roles, 'editSX')
    };

    getAuth()
      .createCustomToken(uid, additionalClaims)
      .then(customToken => res.json({ firebaseToken: customToken }))
      .catch(err => {
        console.warn(err);
        res.status(500).send({
          message: 'Something went wrong acquiring a Firebase token.',
          error: err
        });
      });
  };

  app.get('/auth/firebase/auth0', jwtCheck, authenticate);
  app.get('/firebase/auth0', jwtCheck, authenticate);

  return functions.region('europe-west1').https.onRequest(app);
};
