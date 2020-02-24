const firebaseAdmin = require('firebase-admin');

const auth = require('./auth');
const xml = require('./xml');

firebaseAdmin.initializeApp();

exports.auth = auth.auth(firebaseAdmin);
exports.xml = xml.xml(firebaseAdmin);
