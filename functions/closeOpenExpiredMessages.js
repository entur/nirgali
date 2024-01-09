const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');
const { addHours, parseISO } = require('date-fns');

exports.closeOpenExpiredMessages = function () {
  return functions
    .region('europe-west1')
    .pubsub.schedule('every 30 minutes')
    .onRun(async (_) => {
      const dateTime = new Date().toISOString();
      console.info('closeOpenExpiredMessages started - dateTime=' + dateTime);
      const db = getFirestore();

      try {
        const openSnapshot = await db
          .collectionGroup('messages')
          .where('Progress', '==', 'open')
          .get();

        openSnapshot.docs.forEach((docSnapshot) => {
          db.runTransaction((transaction) => {
            return transaction
              .get(docSnapshot.ref)
              .then((doc) => {
                if (
                  doc.data().ValidityPeriod.EndTime &&
                  dateTime > doc.data().ValidityPeriod.EndTime
                ) {
                  const endTime = addHours(
                    parseISO(doc.data().ValidityPeriod.EndTime),
                    5,
                  ).toISOString();
                  console.log(
                    `Closing message id=${doc.id} situationNumber=${
                      doc.data().SituationNumber
                    } newEndTime=${endTime}`,
                  );
                  transaction.update(docSnapshot.ref, {
                    Progress: 'closed',
                    ValidityPeriod: {
                      StartTime: doc.data().ValidityPeriod.StartTime,
                      EndTime: endTime,
                    },
                  });
                }
              })
              .then(function () {
                console.debug('Transaction successfully committed!');
              })
              .catch(function (error) {
                console.log('Transaction failed: ', error);
              });
          });
        });
      } catch (error) {
        console.error('Error in closeOpenExpiredMessages: ', error);
      }
    });
};
