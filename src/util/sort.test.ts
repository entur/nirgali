import { sortBySituationNumber } from './sort';

test('sortBySituationNumber', () => {
  expect(
    [
      { situationNumber: 'COD:SituationNumber:9' },
      { situationNumber: 'COD:SituationNumber:1' },
      { situationNumber: 'COD:SituationNumber:5' },
      { situationNumber: 'COD:SituationNumber:3' },
    ].sort(sortBySituationNumber),
  ).toEqual([
    { situationNumber: 'COD:SituationNumber:1' },
    { situationNumber: 'COD:SituationNumber:3' },
    { situationNumber: 'COD:SituationNumber:5' },
    { situationNumber: 'COD:SituationNumber:9' },
  ]);
});
