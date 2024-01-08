const { initializeApp } = require('firebase-admin/app');

const auth = require('./auth');
const xml = require('./xml');
const { logDbWrites } = require('./logDbWrites');
const { closeOpenExpiredMessages } = require('./closeOpenExpiredMessages');

initializeApp();

exports.auth = auth.auth();
exports.xml = xml.xml();
exports.closeOpenExpiredMessages =
  closeOpenExpiredMessages.closeOpenExpiredMessages();
exports.logDbWrites = logDbWrites.logDbWrites();
