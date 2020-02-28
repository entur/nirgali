export const sortBySituationNumber = (a, b) => {
  const aN = parseInt(a.data.SituationNumber.split(":").pop());
  const bN = parseInt(b.data.SituationNumber.split(":").pop());

  if (aN > bN) return 1;
  if (aN < bN) return -1;
  return 0;
}
