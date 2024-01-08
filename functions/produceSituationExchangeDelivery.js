const {
  transformSituationData,
  filterOpenExpiredMessages,
} = require('./utils');
export const produceSituationExchangeDelivery = async (db, dateTime) => {
  const open = db
    .collectionGroup('messages')
    .where('Progress', '==', 'open')
    .get();

  const closed = db
    .collectionGroup('messages')
    .where('Progress', '==', 'closed')
    .where('ValidityPeriod.EndTime', '>', dateTime)
    .get();

  const [openSnapshot, closedSnapshot] = await Promise.all([open, closed]);

  const allDocs = openSnapshot.docs.concat(closedSnapshot.docs);
  const situations = { PtSituationElement: [] };

  situations.PtSituationElement = allDocs
    .map((doc) => transformSituationData(doc.data()))
    .filter(filterOpenExpiredMessages(dateTime));

  console.log(
    'Returning number of situations: ' + situations.PtSituationElement.length,
  );

  return {
    ResponseTimestamp: dateTime,
    Situations: situations,
  };
};
