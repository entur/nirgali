export const getLineOption = (lines: any[], id: string) => {
  const line = lines.find((l) => l.id === id);
  return line
    ? {
        value: line.id,
        label: `${line.name} (${line.publicCode}) - ${line.id}`,
      }
    : {
        label: 'Ukjent linje',
      };
};
