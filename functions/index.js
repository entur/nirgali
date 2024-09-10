const { initializeApp } = require('firebase-admin/app');

const auth = require('./auth');
const logDbWrites = require('./logDbWrites');

initializeApp();

exports.auth = auth.auth();
exports.logDbWrites = logDbWrites.logDbWrites();
