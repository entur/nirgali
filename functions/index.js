const { initializeApp } = require('firebase-admin/app');

const auth = require('./auth');
const xml = require('./xml');

initializeApp();

exports.auth = auth.auth();
exports.xml = xml.xml();
exports.closeOpenExpiredMessages = xml.closeOpenExpiredMessages();
exports.logDbWrites = xml.logDbWrites();
