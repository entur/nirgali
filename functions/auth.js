

const functions = require('firebase-functions');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const AUTH_DOMAIN = 'kc-dev.devstage.entur.io';
const AUTH_REALM = 'rutebanken';
const AUTH_ALGORITHM = 'RS256';

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
      jwksUri: `https://${AUTH_DOMAIN}/auth/realms/${AUTH_REALM}/protocol/openid-connect/certs`
    }),
    issuer: `https://${AUTH_DOMAIN}/auth/realms/rutebanken`,
    algorithm: AUTH_ALGORITHM
  });

  app.get('/firebase', jwtCheck, (req, res) => {

    const {
      sub: uid,
      roles
    } = req.user;

    firebaseAdmin.auth().createCustomToken(uid, { roles })
      .then(customToken =>
        res.json({firebaseToken: customToken})
      )
      .catch(err => {
        console.warn(err);
        res.status(500).send({
          message: 'Something went wrong acquiring a Firebase token.',
          error: err
        });
      });
  });

  return functions.https.onRequest(app);
}
