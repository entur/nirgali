import { sortBySituationNumber } from './sort';

test('sortBySituationNumber', () => {
  expect(
    [
      { data: { SituationNumber: 'COD:SituationNumber:9' } },
      { data: { SituationNumber: 'COD:SituationNumber:1' } },
      { data: { SituationNumber: 'COD:SituationNumber:5' } },
      { data: { SituationNumber: 'COD:SituationNumber:3' } },
    ].sort(sortBySituationNumber)
  ).toEqual([
    { data: { SituationNumber: 'COD:SituationNumber:1' } },
    { data: { SituationNumber: 'COD:SituationNumber:3' } },
    { data: { SituationNumber: 'COD:SituationNumber:5' } },
    { data: { SituationNumber: 'COD:SituationNumber:9' } },
  ]);
});
