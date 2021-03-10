const functions = require('firebase-functions');
const jwt = require('express-jwt'); 
const jwks = require('jwks-rsa');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const auth0ClaimsNamespace = functions.config().auth.firebase.auth0.claims_namespace;

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

  const jwtCheck = (authMethod) => jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: functions.config().auth.firebase[authMethod].auth_jwks_uri
    }),
    issuer: functions.config().auth.firebase[authMethod].auth_issuer,
    algorithm: 'RS256'
  });

  const authenticate = authMethod => (req, res) => {
    const { sub: uid } = req.user;
    let roles;

    if (authMethod === 'kc') {
      roles = req.user.roles;
    } else if (authMethod === 'auth0') {
      roles = req.user[auth0ClaimsNamespace];
    } else {
      throw new Error("Unknown auth method");
    }

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
  };

  app.get('/api/auth/firebase/kc', jwtCheck('kc'), authenticate('kc'));
  app.get('/api/auth/firebase/auth0', jwtCheck('auth0'), authenticate('auth0'));

  return functions.https.onRequest(app);
};
