const functions = require('firebase-functions');

exports.logDbWrites = function () {
  return functions
    .region('europe-west1')
    .firestore.document(
      'codespaces/{codespace}/authorities/{authority}/messages/{messageId}',
    )
    .onWrite((change, context) => {
      const { codespace, authority, messageId } = context.params;

      console.log(
        `Message written: codespace=${codespace} authority=${authority} messageId=${messageId}:\n${JSON.stringify(
          change.after.data(),
        )}`,
      );
    });
};
