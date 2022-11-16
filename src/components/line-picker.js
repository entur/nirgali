import React from 'react';
import Select from 'react-select';

const DEFAULT_PLACEHOLDER = 'Velg linje';

const LinePicker = ({ lines, onChange }) => {
  return (
    <Select
      placeholder={DEFAULT_PLACEHOLDER}
      onChange={onChange}
      options={getLineOptions(lines)}
    />
  );
};

const getLineOptions = (lines) => {
  return lines
    .sort((a, b) => {
      if (a.publicCode > b.publicCode) return 1;
      else if (b.publicCode > a.publicCode) return -1;
      else return 0;
    })
    .map((item) => ({
      label: `${item.publicCode} ${item.name} (${item.id})`,
      value: item.id,
    }));
};

export default LinePicker;
