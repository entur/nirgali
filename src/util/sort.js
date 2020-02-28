export const sortBySituationNumber = (a, b) => {
  return sortAsc(
    getSituationNumberSequence(a.data.SituationNumber),
    getSituationNumberSequence(b.data.SituationNumber)
  );
}

const sortAsc = (a, b) => a - b;

const getSituationNumberSequence = SituationNumber => {
  return parseInt(SituationNumber.split(':').pop());
}
